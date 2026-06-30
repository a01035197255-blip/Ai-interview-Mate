package io.github.seong5381.interviewMate.email.controller;

import io.github.seong5381.interviewMate.auth.service.UserAuthService;
import io.github.seong5381.interviewMate.email.dto.request.EmailCodeCheckRequest;
import io.github.seong5381.interviewMate.email.dto.request.EmailVerificationRequest;
import io.github.seong5381.interviewMate.email.dto.request.PasswordResetEmailRequest;
import io.github.seong5381.interviewMate.email.dto.request.PasswordResetSubmitRequest; // ✨ 신규 추가
import io.github.seong5381.interviewMate.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailAuthController {

    private final UserAuthService userAuthService;

    /**
     * 📩 1-1. 회원가입용 인증번호 메일 발송
     */
    @PostMapping("/verify-request")
    public ResponseEntity<ApiResponse<String>> requestVerificationCode(
            @Valid @RequestBody EmailVerificationRequest request) {
        log.info("📧 회원가입 인증번호 요청 -> 이메일: {}", request.email());
        userAuthService.requestVerificationCode(request.email());
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("인증번호가 성공적으로 발송되었습니다."));
    }

    /**
     * 🔐 1-2. 회원가입용 인증번호 검증
     */
    @PostMapping("/verify-check")
    public ResponseEntity<ApiResponse<String>> verifyEmailCode(
            @Valid @RequestBody EmailCodeCheckRequest request) {
        log.info("🔍 회원가입 인증번호 검증 시도 -> 이메일: {}", request.email());
        userAuthService.verifyEmailCode(request.email(), request.verificationCode());
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("이메일 인증에 성공했습니다."));
    }

    /**
     * 🔑 2-1. 비밀번호 찾기 - 재설정 링크 메일 발송
     */
    @PostMapping("/password-reset-request")
    public ResponseEntity<ApiResponse<String>> requestPasswordReset(
            @Valid @RequestBody PasswordResetEmailRequest request) {
        log.info("🔗 비밀번호 재설정 링크 요청 -> 이메일: {}", request.email());
        userAuthService.requestPasswordReset(request.email());
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("비밀번호 재설정 링크가 이메일로 발송되었습니다."));
    }

    /**
     * 💾 2-2. 비밀번호 찾기 - 링크 클릭 후 새로운 비밀번호로 최종 변경
     * ✨ [신규 구현] UserAuthService.resetPassword()와 매핑되는 최종 변경 엔드포인트입니다.
     */
    @PostMapping("/password-reset-submit")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody PasswordResetSubmitRequest request) {
        log.info("💾 메일 토큰 기반 비밀번호 변경 처리 시작");
        userAuthService.resetPassword(
                request.token(),
                request.newPassword(),
                request.confirmPassword()
        );
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("비밀번호가 성공적으로 변경되었습니다."));
    }
}