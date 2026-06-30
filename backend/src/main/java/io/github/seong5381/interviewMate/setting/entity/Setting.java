package io.github.seong5381.interviewMate.setting.entity;

import io.github.seong5381.interviewMate.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "setting")
public class Setting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 직무
    @Enumerated(EnumType.STRING)
    private JobType jobType;

    // 경력
    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;

    // 회사 유형
    @Enumerated(EnumType.STRING)
    private CompanyType companyType;
}