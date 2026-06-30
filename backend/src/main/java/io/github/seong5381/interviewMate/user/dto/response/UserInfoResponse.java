package io.github.seong5381.interviewMate.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResponse {
    private String userName;
    private String email;
    private byte[] profileImgUrl;
    private String provider;
}
