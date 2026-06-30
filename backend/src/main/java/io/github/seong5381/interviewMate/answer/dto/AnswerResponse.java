package io.github.seong5381.interviewMate.answer.dto;

import io.github.seong5381.interviewMate.answer.entity.Answer;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AnswerResponse {

    private Long id;
    private Long questionId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;

    // =========================
    // from 변환
    // =========================
    public static AnswerResponse from(Answer a) {
        return AnswerResponse.builder()
                .id(a.getId())
                .questionId(a.getQuestion().getId())
                .content(a.getContent())
                .createdAt(a.getCreatedAt())
                .answeredAt(a.getAnsweredAt())
                .build();
    }
}