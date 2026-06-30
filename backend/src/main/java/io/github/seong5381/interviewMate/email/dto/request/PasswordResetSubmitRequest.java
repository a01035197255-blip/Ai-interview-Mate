package io.github.seong5381.interviewMate.email.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetSubmitRequest(
        @NotBlank String token,
        @NotBlank String newPassword,
        @NotBlank String confirmPassword
) {}
