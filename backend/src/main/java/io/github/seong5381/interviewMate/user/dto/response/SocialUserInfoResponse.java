package io.github.seong5381.interviewMate.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SocialUserInfoResponse {
    private String userName;
    private String email;
    private String profileImgUrl;
    private String provider;
}
