package io.github.seong5381.interviewMate.auth.service;

import io.github.seong5381.interviewMate.auth.domain.Role;
import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.dto.request.*;
import io.github.seong5381.interviewMate.auth.dto.response.LoginResponse;
import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2Provider;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.email.service.MailService;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.global.security.JwtTokenProvider;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 🚀 기본을 readOnly로 설정하여 DB 부하를 줄이고 동시성을 향상시킵니다.
public class UserAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authManager;
    private final RedisTemplate<String, String> redisTemplate;
    private final MailService mailService;

    // Redis Key Prefix 상수화 관리
    private static final String AUTH_CODE_PREFIX = "AUTH_CODE:";
    private static final String RESET_TOKEN_PREFIX = "RESET_TOKEN:";
    private static final String VERIFIED_EMAIL_PREFIX = "VERIFIED_EMAIL:";
    private static final String REFRESH_TOKEN_PREFIX = "REFRESH_TOKEN:";
    private static final String BLACKLIST_PREFIX = "BL: ";

    // ==========================================
    // ✨ 이메일 인증 및 비밀번호 찾기 흐름
    // ==========================================

    /**
     * 1-1. 회원가입용 인증번호 발송 요청
     */
    public void requestVerificationCode(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new AuthException(ErrorCode.EMAIL_DUPLICATED, ErrorCode.EMAIL_DUPLICATED.getStatus());
        }

        String verificationCode = String.format("%06d", new Random().nextInt(1000000));
        redisTemplate.opsForValue().set(AUTH_CODE_PREFIX + email, verificationCode, Duration.ofMinutes(3));

        // 🚨 네트워크 IO(메일 발송)는 트랜잭션 외부(readOnly 상태)에서 도는 것이 안전합니다.
        mailService.sendVerificationCodeMail(email, verificationCode);
    }

    /**
     * 1-2. 회원가입용 인증번호 검증
     */
    public void verifyEmailCode(String email, String code) {
        String storedCode = redisTemplate.opsForValue().get(AUTH_CODE_PREFIX + email);

        if (storedCode == null || !storedCode.equals(code)) {
            throw new AuthException(ErrorCode.EMAIL_CODE_INVALID, ErrorCode.EMAIL_CODE_INVALID.getStatus());
        }

        redisTemplate.delete(AUTH_CODE_PREFIX + email);
        redisTemplate.opsForValue().set(VERIFIED_EMAIL_PREFIX + email, "true", Duration.ofMinutes(5));
    }

    /**
     * 2-1. 비밀번호 찾기 - 재설정 링크 이메일 발송
     */
    public void requestPasswordReset(String email) {
        // 유저 존재 여부만 단순 조회 (readOnly)
        if (!userRepository.existsByEmail(email)) {
            throw new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus());
        }

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(RESET_TOKEN_PREFIX + resetToken, email, Duration.ofMinutes(5));

        mailService.sendPasswordResetLinkMail(email, resetToken);
    }

    /**
     * 2-2. 비밀번호 찾기 - 링크 클릭 후 새로운 비밀번호로 재설정
     */
    @Transactional // 🚀 쓰기 격리성 확보
    public void resetPassword(String token, String newPassword, String confirmPassword) {
        String email = redisTemplate.opsForValue().get(RESET_TOKEN_PREFIX + token);
        if (email == null) {
            throw new AuthException(ErrorCode.TOKEN_INVALID, ErrorCode.TOKEN_INVALID.getStatus());
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new AuthException(ErrorCode.PASSWORD_MISMATCH, ErrorCode.PASSWORD_MISMATCH.getStatus());
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        user.changePassword(passwordEncoder.encode(newPassword));

        // 데이터 정합성을 위해 꼬리표 일괄 삭제
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
        redisTemplate.delete(RESET_TOKEN_PREFIX + token);
    }


    // ==========================================
    // 🔐 기존 회원 관련 핵심 로직
    // ==========================================

    /**
     * 회원 가입 (이메일 최종 가드 레이어 안착)
     */
    @Transactional // 🚀 DB 커밋 유도
    public void register(RegisterRequest request) {
        String email = request.getEmail();

        if (userRepository.existsByEmail(email)) {
            throw new AuthException(ErrorCode.EMAIL_DUPLICATED, ErrorCode.EMAIL_DUPLICATED.getStatus());
        }

        // 🔥 [검증 추가] 1-2단계에서 세팅한 가입 허가권이 레디스에 유효한지 철저 검증
        String isVerified = redisTemplate.opsForValue().get(VERIFIED_EMAIL_PREFIX + email);
        if (isVerified == null || !isVerified.equals("true")) {
            throw new AuthException(ErrorCode.EMAIL_CODE_INVALID, ErrorCode.EMAIL_CODE_INVALID.getStatus());
        }

        userRepository.save(User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getUsername())
                .role(Role.USER)
                .build());

        // 가입 완료 후 토큰값 회수 및 삭제
        redisTemplate.delete(VERIFIED_EMAIL_PREFIX + email);
    }

    /**
     * 로그인
     */
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetail userDetail = (UserDetail) auth.getPrincipal();
        String email = userDetail.getUsername();
        String role = userDetail.getUser().getRole().name();

        String accessToken = jwtTokenProvider.createAccessToken(email, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(email);

        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + email, refreshToken, Duration.ofDays(7));

        ResponseCookie setCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true) // 배포 환경 환경 변수 처리 권장
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, setCookie.toString());

        return new LoginResponse(accessToken);
    }

    /**
     * 로그아웃
     */
    public void logout(String accessToken, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        if (user.getProvider() == OAuth2Provider.LOCAL) {
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
        } else {
            redisTemplate.delete("OAUTH_REFRESH_TOKEN:" + email); // OAuth용도 상단에 Prefix 빼두시면 편합니다.
        }

        long remainingMs = jwtTokenProvider.getRemainingMs(accessToken);
        if (remainingMs > 0) {
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + accessToken, "logout", Duration.ofMillis(remainingMs));
        }
    }

    /**
     * 마이페이지 내에서의 비밀번호 변경 (로그인 상태)
     */
    @Transactional // 🚀 엔티티 더티 체킹 유도용
    public void changePassword(PasswordRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.PROFILE_NOT_FOUND.getStatus()));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AuthException(ErrorCode.WRONG_PASSWORD, ErrorCode.WRONG_PASSWORD.getStatus());
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AuthException(ErrorCode.PASSWORD_MISMATCH, ErrorCode.PASSWORD_MISMATCH.getStatus());
        }

        user.changePassword(passwordEncoder.encode(request.getNewPassword()));
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
    }

    /**
     * Access Token 만료 시 재발급
     */
    public String refreshAccessToken(String refreshToken) {
        jwtTokenProvider.validate(refreshToken);

        String email = jwtTokenProvider.getEmail(refreshToken);
        String stored = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + email);

        if (!refreshToken.equals(stored)) {
            throw new AuthException(ErrorCode.TOKEN_INVALID, ErrorCode.TOKEN_INVALID.getStatus());
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        return jwtTokenProvider.createAccessToken(email, user.getRole().name());
    }

    /**
     * 회원 탈퇴
     */
    @Transactional // 🚀 DB 데이터 삭제 유도
    public void withDraw(WithdrawRequest request, String accessToken, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException(ErrorCode.WRONG_PASSWORD, ErrorCode.WRONG_PASSWORD.getStatus());
        }

        long remainingMs = jwtTokenProvider.getRemainingMs(accessToken);
        if (remainingMs > 0) {
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + accessToken, "withdraw", Duration.ofMillis(remainingMs));
        }

        userRepository.delete(user);
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
    }
}