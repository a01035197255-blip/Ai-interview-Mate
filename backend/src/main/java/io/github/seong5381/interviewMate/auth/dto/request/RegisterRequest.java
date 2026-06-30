package io.github.seong5381.interviewMate.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RegisterRequest {
    @NotBlank(message = "사용자 이름은 필수 입니다")
    private String username;

    @NotBlank(message = "이메일을 필수 입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입니다")
    @Pattern(
            regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*\\W).{10,}$",
            message = "비밀번호는 영문, 숫자, 특수문자를 포함하여 10자 이상이어야 합니다."
    )
    private String password;
}
