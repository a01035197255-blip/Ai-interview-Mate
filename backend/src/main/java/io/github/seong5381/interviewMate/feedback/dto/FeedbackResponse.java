package io.github.seong5381.interviewMate.feedback.dto;

import io.github.seong5381.interviewMate.feedback.entity.Feedback;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FeedbackResponse {

    private Integer technicalAccuracy;
    private Integer logic;
    private Integer structure;
    private Integer communication;
    private Integer totalScore;
    private Integer problemSolving;

    private String tier;
    private String tierDescription;

    private String feedback;
    private String strengths;
    private String improvements;

    // 🔥 from 메서드
    public static FeedbackResponse from(Feedback f) {
        return FeedbackResponse.builder()
                .problemSolving(f.getProblemSolving())
                .technicalAccuracy(f.getTechnicalAccuracy())
                .logic(f.getLogic())
                .structure(f.getStructure())
                .communication(f.getCommunication())
                .totalScore(f.getTotalScore())
                .tier(f.getTier())
                .tierDescription(f.getTierDescription())
                .feedback(f.getFeedback())
                .strengths(f.getStrengths())
                .improvements(f.getImprovements())
                .build();
    }
}