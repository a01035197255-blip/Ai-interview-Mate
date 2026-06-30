package io.github.seong5381.interviewMate.auth.oauth2.module;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OAuth2Provider {
    GOOGLE("google"),
    NAVER("naver"),
    LOCAL("local");

    private final String registrationId;
}
