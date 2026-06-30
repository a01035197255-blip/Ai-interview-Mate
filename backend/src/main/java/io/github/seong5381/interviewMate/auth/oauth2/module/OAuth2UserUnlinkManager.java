package io.github.seong5381.interviewMate.auth.oauth2.module;

import io.github.seong5381.interviewMate.auth.oauth2.exception.OAuth2AuthenticationProcessingException;
import io.github.seong5381.interviewMate.auth.oauth2.google.GoogleOAuth2UserUnlink;
import io.github.seong5381.interviewMate.auth.oauth2.naver.NaverOAuth2UserUnlink;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class OAuth2UserUnlinkManager {

    private final GoogleOAuth2UserUnlink googleOAuth2UserUnlink;
    private final NaverOAuth2UserUnlink naverOAuth2UserUnlink;

    public void unlink(OAuth2Provider provider, String refreshToken) {
        if (OAuth2Provider.GOOGLE.equals(provider)) {
            googleOAuth2UserUnlink.unlink(refreshToken);
        } else if (OAuth2Provider.NAVER.equals(provider)) {
            naverOAuth2UserUnlink.unlink(refreshToken);
        }  else {
            throw new OAuth2AuthenticationProcessingException(
                    "Unlink with " + provider.getRegistrationId() + " is not supported");
        }
    }
}
