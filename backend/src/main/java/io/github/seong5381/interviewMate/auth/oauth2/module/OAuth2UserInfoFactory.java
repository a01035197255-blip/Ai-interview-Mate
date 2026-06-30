package io.github.seong5381.interviewMate.auth.oauth2.module;



import io.github.seong5381.interviewMate.auth.oauth2.exception.OAuth2AuthenticationProcessingException;
import io.github.seong5381.interviewMate.auth.oauth2.google.GoogleOAuth2UserInfo;
import io.github.seong5381.interviewMate.auth.oauth2.naver.NaverOAuth2UserInfo;

import java.util.Map;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId,
                                                   String accessToken,
                                                   Map<String, Object> attributes) {
        if (OAuth2Provider.GOOGLE.getRegistrationId().equals(registrationId)) {
            return new GoogleOAuth2UserInfo(accessToken, attributes);
        } else if (OAuth2Provider.NAVER.getRegistrationId().equals(registrationId)) {
            return new NaverOAuth2UserInfo(accessToken, attributes);
        } else {
            throw new OAuth2AuthenticationProcessingException("Login with " + registrationId + " is not supported");
        }
    }
}
