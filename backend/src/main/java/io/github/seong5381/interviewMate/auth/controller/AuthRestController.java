package io.github.seong5381.interviewMate.auth.controller;

import io.github.seong5381.interviewMate.auth.dto.request.PasswordRequest;
import io.github.seong5381.interviewMate.auth.dto.request.LoginRequest;
import io.github.seong5381.interviewMate.auth.dto.request.RegisterRequest;
import io.github.seong5381.interviewMate.auth.dto.request.WithdrawRequest;
import io.github.seong5381.interviewMate.auth.dto.response.LoginResponse;
import io.github.seong5381.interviewMate.auth.service.UserAuthService;
import io.github.seong5381.interviewMate.email.dto.request.PasswordResetSubmitRequest;
import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthRestController {

    private final UserAuthService userAuthService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest registerRequestDto) {
        userAuthService.register(registerRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("회원가입이 완료되었습니다"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest,
                                                            HttpServletResponse response) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("로그인 성공!", userAuthService.login(loginRequest, response)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestHeader("Authorization") String token,
                                                      @AuthenticationPrincipal UserDetail userDetail,
                                                      HttpServletResponse response) {
        deleteRefreshCookie(response);
        userAuthService.logout(token.substring(7), userDetail.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("로그아웃 완료"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> response(HttpServletRequest request) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        String newAccessToken = userAuthService.refreshAccessToken(refreshToken);
        LoginResponse loginResponse = new LoginResponse(newAccessToken);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("토큰 재발급 완료", loginResponse));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody @Valid PasswordRequest request,
                                               @AuthenticationPrincipal UserDetail userDetail) {
        userAuthService.changePassword(request, userDetail.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("비밀번호 변경 완료"));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody @Valid PasswordResetSubmitRequest request) {
        userAuthService.resetPassword(request.token(), request.newPassword(), request.confirmPassword());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("비밀번호가 성공적으로 초기화되었습니다."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<String>> deleteUser (@RequestHeader("Authorization") String token,
                                                           @RequestBody @Valid WithdrawRequest request,
                                                           @AuthenticationPrincipal UserDetail userDetail,
                                                           HttpServletResponse response) {
        deleteRefreshCookie(response);
        userAuthService.withDraw(request, token.substring(7), userDetail.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("탈퇴 처리 완료"));
    }

    private void deleteRefreshCookie(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false) // 로컬 환경에 맞춰 설정 (운영계는 true)
                .path("/")
                .maxAge(0) // 👈 0초로 설정하는 순간 브라우저 창고에서 즉시 삭제됨
                .sameSite("Lax") // 기존에 설정했던 값과 일치시켜야 함
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
    }
}
