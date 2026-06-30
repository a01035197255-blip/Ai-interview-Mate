package io.github.seong5381.interviewMate.auth.oauth2.service;

import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.domain.Role;
import io.github.seong5381.interviewMate.auth.dto.response.TokenResponse;
import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2Provider;
import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2UserUnlinkManager;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;

import io.github.seong5381.interviewMate.auth.oauth2.exception.OAuth2AuthenticationProcessingException;
import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2UserInfo;
import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2UserInfoFactory;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final OAuth2UserUnlinkManager oAuth2UserUnlinkManager;
    private final StringRedisTemplate redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    private final String REDIS_KEY = "OAUTH_REFRESH_TOKEN:";

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    public TokenResponse getExchangeCode(String code) {
        // 1. 임시 코드로 킵해둔 엑세스 토큰 불러오기
        String accessToken = redisTemplate.opsForValue().get("OAUTH_CODE" + code);

        if (accessToken == null) {
            throw new AuthException(ErrorCode.TOKEN_EXPIRED, ErrorCode.TOKEN_EXPIRED.getStatus());
        }

        // 일회용 코드는 즉시 삭제 (보안 굿)
        redisTemplate.delete("OAUTH_CODE" + code);

        String email = jwtTokenProvider.getEmail(accessToken);

        String redisKey = REDIS_KEY + email;
        String refreshToken = redisTemplate.opsForValue().get(redisKey);

        // 2. 만약 기존에 저장된 리프레시 토큰이 없으면 새로 생성 후 동일한 Key로 킵
        if (refreshToken == null) {
            refreshToken = jwtTokenProvider.createRefreshToken(email);
            redisTemplate.opsForValue().set(redisKey, refreshToken, java.time.Duration.ofDays(7));
        }

        // 3. 쿠키 굽기 (SameSite=None 이므로 실배포 시 secure=true 조건 필수인 점 인지해두세요!)
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true) // 로컬 HTTP 환경 테스트를 위해 임시 false (HTTPS 환경에선 true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        return new TokenResponse(accessToken, refreshTokenCookie);
    }

    @Transactional
    public void withdraw(String accessToken, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        if (user.getProvider() == OAuth2Provider.GOOGLE) {
            String googleRefreshToken = user.getRefreshToken();
            if (StringUtils.hasText(googleRefreshToken)) {
                try {
                    redisKeyDelete(email);
                    oAuth2UserUnlinkManager.unlink(user.getProvider(), googleRefreshToken);
                } catch (Exception e) {
                    log.error("❌ Google 연동 해제 실패 (안전장치: DB 데이터는 마저 삭제합니다): {}", e.getMessage());
                }
            }
        }

        if(user.getProvider() == OAuth2Provider.NAVER) {
            String naverRefreshToken = user.getRefreshToken();
            if(StringUtils.hasText(naverRefreshToken)) {
                try {
                    redisKeyDelete(email);
                    oAuth2UserUnlinkManager.unlink(user.getProvider(), naverRefreshToken);
                } catch (Exception e) {
                    log.error("❌ Naver 연동 해제 실패 (안전장치: DB 데이터는 마저 삭제합니다): {}", e.getMessage());
                }
            }
        }
        long remainingMs = jwtTokenProvider.getRemainingMs(accessToken);
        if (remainingMs > 0) {
            redisTemplate.opsForValue().set(
                    "BL: " + accessToken,
                    "withdraw", // 로그아웃과 구분하기 위해 value를 "withdraw"로 저장하면 디버깅할 때 편합니다!
                    Duration.ofMillis(remainingMs)
            );
        }

        userRepository.delete(user);
        log.info("✅ 회원 탈퇴 완료 (DB 삭제 완료): {}", email);
    }

    private void redisKeyDelete(String email) {
        redisTemplate.delete(REDIS_KEY + email);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String accessToken = userRequest.getAccessToken().getTokenValue();

        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId,
                accessToken,
                oAuth2User.getAttributes());

        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        // 1. 엔티티 규격에 맞춰 문자열(google)을 OAuth2Provider enum 타입으로 변경합니다.
        OAuth2Provider provider = OAuth2Provider.valueOf(registrationId.toUpperCase());

        // 2. DB 저장 혹은 업데이트 로직을 태웁니다.
        User user = saveOrUpdate(oAuth2UserInfo, provider, accessToken);

        // 3. 컨트롤러나 성공 핸들러에서 DB 유저 ID 같은 정보에 바로 접근할 수 있도록 user 객체를 통째로 넘겨줍니다.
        return new OAuth2UserPrincipal(oAuth2UserInfo, user);
    }

    private User saveOrUpdate(OAuth2UserInfo oAuth2UserInfo, OAuth2Provider provider, String refreshToken) {
        return userRepository.findByEmail(oAuth2UserInfo.getEmail())
                .map(existingUser -> {
                    // 다른 플랫폼 가입 방어 로직 (유지)
                    if (!existingUser.getProvider().equals(provider)) {
                        throw new OAuth2AuthenticationProcessingException(
                                "Looks like you're signed up with " + existingUser.getProvider() + " account. Please use your " + existingUser.getProvider() + " login.");
                    }

                    // [★ 추가] 이미 가입된 유저라도 로그인을 다시 했을 때 리프레시 토큰이 새로 들어왔다면 업데이트해 줍니다.
                    // (구글은 prompt=consent 일 때만 리프레시 토큰을 주므로 null 체크가 필수입니다.)
                    if (refreshToken != null) {
                        existingUser.updateRefreshToken(refreshToken);
                    }

                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // 신규 소셜 유저 회원가입
                    User newUser = User.builder()
                            .email(oAuth2UserInfo.getEmail())
                            .name(oAuth2UserInfo.getName())
                            .role(Role.USER)
                            .provider(provider)
                            .providerId(oAuth2UserInfo.getId()) // 아까 말한 구글 고유 유저 일련번호 매핑!

                            // [★ 추가] 신규 가입 시점에 구글 리프레시 토큰을 함께 저장합니다.
                            .refreshToken(refreshToken)
                            .profileImgLink(oAuth2UserInfo.getProfileImageUrl())
                            .build();

                    return userRepository.save(newUser);
                });
    }
}