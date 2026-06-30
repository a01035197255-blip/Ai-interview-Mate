package io.github.seong5381.interviewMate.email.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailCodeCheckRequest(
        @NotBlank @Email String email,
        @NotBlank String verificationCode) {}
