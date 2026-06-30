package io.github.seong5381.interviewMate.question.dto;

import io.github.seong5381.interviewMate.question.entity.Question;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuestionResponse {

    private Long id;
    private Long sessionId;
    private Integer stepOrder;
    private String aiQuestion;
    private LocalDateTime createdAt;

    public static QuestionResponse from(Question q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .sessionId(q.getSession().getId())
                .stepOrder(q.getStepOrder())
                .aiQuestion(q.getAiQuestion())
                .createdAt(q.getCreatedAt())
                .build();
    }
}