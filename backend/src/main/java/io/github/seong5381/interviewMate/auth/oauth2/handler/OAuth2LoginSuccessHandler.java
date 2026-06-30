package io.github.seong5381.interviewMate.auth.oauth2.handler;

import io.github.seong5381.interviewMate.auth.oauth2.service.OAuth2UserPrincipal; // 타입 변경
import io.github.seong5381.interviewMate.global.security.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.util.UriComponentsBuilder; // 안전한 리다이렉트용
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
@NullMarked
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate redisTemplate;

    @Value("${frontend_base_url}")
    private String FRONT_URL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        // 1. [핵심 수정] 검증 대상을 OAuth2UserPrincipal로 변경합니다.
        if (!(authentication.getPrincipal() instanceof OAuth2UserPrincipal principal)) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        // 2. principal 내부에 저장된 user 엔티티로부터 값 추출
        String email = principal.getUsername();
        String role = principal.getUser().getRole().name();

        // 3. JWT 토큰 정상 발행
        String accessToken = jwtTokenProvider.createAccessToken(email, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(email);

        // Redis에 토큰 및 임시 코드 저장
        redisTemplate.opsForValue().set("OAUTH_REFRESH_TOKEN:" + email, refreshToken, Duration.ofDays(7));

        String tempCode = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set("OAUTH_CODE" + tempCode, accessToken, 10, TimeUnit.MINUTES);

        // 4. 프론트엔드로 안전하게 리다이렉트
        String frontUrl = FRONT_URL + "/oauth/callback";
        String targetUrl = UriComponentsBuilder.fromUriString(frontUrl)
                .queryParam("code", tempCode)
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}