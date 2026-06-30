package io.github.seong5381.interviewMate.question.entity;

import io.github.seong5381.interviewMate.session.entity.Session;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "question")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 면접 세션
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    // 진행 순서 (1~10)
    @Column(nullable = false)
    private Integer stepOrder;

    @Builder.Default
    private Integer answered = 0;

    // 질문 내용
    @Column(columnDefinition = "TEXT")
    private String aiQuestion;

    // 생성 시간
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}