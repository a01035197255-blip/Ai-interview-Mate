package io.github.seong5381.interviewMate.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WithdrawRequest {
    @NotBlank
    @Pattern(
            regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*\\W).{10,}$",
            message = "비밀번호는 영문, 숫자, 특수문자를 포함하여 10자 이상이어야 합니다."
    )
    private String password;
}
