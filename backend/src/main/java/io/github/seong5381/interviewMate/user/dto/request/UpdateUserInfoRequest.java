package io.github.seong5381.interviewMate.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Setter
public class UpdateUserInfoRequest {
    @NotBlank(message = "이름을 입력하세요")
    private String userName;
}
