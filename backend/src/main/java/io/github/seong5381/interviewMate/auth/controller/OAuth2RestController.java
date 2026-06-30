package io.github.seong5381.interviewMate.auth.controller;

import io.github.seong5381.interviewMate.auth.dto.response.LoginResponse;
import io.github.seong5381.interviewMate.auth.dto.response.TokenResponse;
import io.github.seong5381.interviewMate.auth.oauth2.service.OAuth2UserService;
import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.JwtTokenProvider;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/oauth2")
@RequiredArgsConstructor
public class OAuth2RestController {
    private final OAuth2UserService oAuth2UserService;

    /* 소셜 로그인
        Google: http://localhost:8080/oauth2/authorization/google
        Naver: http://localhost:8080/oauth2/authorization/naver
     */

    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<LoginResponse>> getAccessToken(@RequestParam("code") String tempCode,
                                                                     HttpServletResponse response) {
        TokenResponse tokenResponse = oAuth2UserService.getExchangeCode(tempCode);
        response.addHeader(HttpHeaders.SET_COOKIE, tokenResponse.getRefreshTokenCookie().toString());

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(LoginResponse.builder()
                                .accessToken(tokenResponse.getAccessToken()).build()));
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<ApiResponse<String>> withdraw(@AuthenticationPrincipal UserDetail userDetail,
                                                        @RequestHeader("Authorization") String token,
                                                        HttpServletResponse response) {

        oAuth2UserService.withdraw(token.substring(7), userDetail.getUser().getEmail());

        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true) // 로컬 환경에 맞춰 설정 (운영계는 true)
                .path("/")
                .maxAge(0) // 👈 0초로 설정하는 순간 브라우저 창고에서 즉시 삭제됨
                .sameSite("Lax") // 기존에 설정했던 값과 일치시켜야 함
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("탈퇴 프로세스 완료"));
    }
}
