package io.github.seong5381.interviewMate.answer.entity;

import io.github.seong5381.interviewMate.question.entity.Question;
import io.github.seong5381.interviewMate.session.entity.Session;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "answer")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    // 사용자 답변
    @Column(columnDefinition = "TEXT")
    private String content;

    // 시간
    private LocalDateTime createdAt;

    // 답변 완료 시간
    private LocalDateTime answeredAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public void markAnswered() {
        this.answeredAt = LocalDateTime.now();
    }
}