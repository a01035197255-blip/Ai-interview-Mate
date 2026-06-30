package io.github.seong5381.interviewMate.ai.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.Getter;

import java.util.List;

@Getter
public class AiScoreResponse {
    private Integer technicalAccuracy;
    private Integer logic;
    private Integer structure;
    private Integer communication;
    private Integer problemSolving;
    private Integer totalScore;
    private String tier;
    private String tierDescription;
    private String feedback;
    private List<String> strengths;
    private List<String> improvements;

    @JsonSetter(value = "strengths", nulls = Nulls.AS_EMPTY)
    public void setStrengths(Object strengths) {
        if (strengths instanceof String) {
            if (((String) strengths).isBlank()) {
                this.strengths = List.of("측정된 강점이 없습니다.");
            } else {
                this.strengths = List.of((String) strengths);
            }
        } else if (strengths instanceof List) {
            this.strengths = (List<String>) strengths;
        }
    }

    @JsonSetter(value = "improvements", nulls = Nulls.AS_EMPTY)
    public void setImprovements(Object improvements) {
        if (improvements instanceof String) {
            if (((String) improvements).isBlank()) {
                this.improvements = List.of("측정된 개선점이 없습니다.");
            } else {
                this.improvements = List.of((String) improvements);
            }
        } else if (improvements instanceof List) {
            this.improvements = (List<String>) improvements;
        }
    }
}