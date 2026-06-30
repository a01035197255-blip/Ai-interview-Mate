package io.github.seong5381.interviewMate.resume.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeCreateRequest {

    // ======================
    // 📌 User 정보 (폼 입력용)
    // ======================
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    // ======================
    // 📌 Resume 정보
    // ======================
    @Min(0)
    @Max(120)
    private int age;

    private String gender;

    @NotBlank
    private String phone;

    private String address;

    private String summary;

    @Size(max = 5000)
    private String selfIntro;

    private String career;

    @Size(max = 5000)
    private String projectIntro;

    @Size(max = 1000)
    private String skills;

    private String education;
}