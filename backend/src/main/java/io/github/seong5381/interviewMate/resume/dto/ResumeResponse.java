package io.github.seong5381.interviewMate.resume.dto;

import io.github.seong5381.interviewMate.resume.entity.Resume;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeResponse {

    private Long id;

    private String name;
    private String email;
    private int age;
    private String gender;
    private String phone;
    private String address;

    private String summary;
    private String selfIntro;

    private String career;
    private String projectIntro;

    private String skills;
    private String education;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ResumeResponse from(Resume r) {
        return ResumeResponse.builder()
                .id(r.getId())
                .name(r.getUser().getName())
                .email(r.getUser().getEmail())
                .age(r.getAge())
                .gender(r.getGender())
                .phone(r.getPhone())
                .address(r.getAddress())
                .summary(r.getSummary())
                .selfIntro(r.getSelfIntro())
                .career(r.getCareer())
                .projectIntro(r.getProjectIntro())
                .skills(r.getSkills())
                .education(r.getEducation())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}