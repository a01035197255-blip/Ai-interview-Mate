package io.github.seong5381.interviewMate.resume.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 🔥 Resume 1 : Feedback 1 구조
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false, unique = true)
    private Resume resume;

    /**
     * =========================
     * 자기소개서 분석
     * =========================
     */

    @Lob
    @Column(columnDefinition = "TEXT")
    private String selfIntroStrength;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String selfIntroWeakness;

    /**
     * =========================
     * 프로젝트 분석
     * =========================
     */

    @Lob
    @Column(columnDefinition = "TEXT")
    private String projectStrength;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String projectWeakness;

    /**
     * =========================
     * AI 종합 평가
     * =========================
     */

    @Column(nullable = false)
    private int totalScore;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String overallFeedback;

    /**
     * =========================
     * 예상 면접 질문 (5개)
     * =========================
     */

    @ElementCollection
    @CollectionTable(
            name = "resume_feedback_questions",
            joinColumns = @JoinColumn(name = "feedback_id")
    )
    @Column(name = "question", columnDefinition = "TEXT")
    private List<String> interviewQuestions = new ArrayList<>();

    /**
     * =========================
     * 생성 시간
     * =========================
     */

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}