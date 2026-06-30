package io.github.seong5381.interviewMate.resume.entity;

import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.resume.entity.ResumeFeedback;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(mappedBy = "resume", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private ResumeFeedback resumeFeedback;

    // ======================
    // 📌 기본 정보 (필수)
    // ======================
    @Min(0)
    @Max(120)
    private int age;            // 나이

    private String gender;      // 성별

    @NotBlank
    @Column(nullable = false)
    private String phone;       // 전화번호

    private String address;     // 주소

    // ======================
    // 📌 소개
    // ======================
    private String summary;     // 간략 소개

    @Column(length = 5000)
    private String selfIntro;   // 자기소개서

    // ======================
    // 📌 경력
    // ======================
    private String career;      // 경력 요약 (회사/직무)

    @Column(length = 5000)
    private String projectIntro; // 프로젝트 설명 (프로젝트/성과/업무)

    // ======================
    // 📌 스킬
    // ======================
    @Column(length = 1000)
    private String skills;      // Spring Boot, Java, Python 등

    // ======================
    // 📌 학력
    // ======================
    private String education;   // 학교/전공/학위

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public String getResumeText() {
        return selfIntro + "\n" + projectIntro;
    }
}