package io.github.seong5381.interviewMate.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.ResponseCookie;

@Getter
@AllArgsConstructor
public class TokenResponse {
    private final String accessToken;
    private final ResponseCookie refreshTokenCookie;
}
