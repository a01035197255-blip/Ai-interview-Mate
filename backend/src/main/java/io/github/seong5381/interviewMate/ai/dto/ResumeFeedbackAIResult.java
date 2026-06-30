package io.github.seong5381.interviewMate.ai.dto;

import lombok.Data;

import java.util.List;

@Data
public class ResumeFeedbackAIResult {

    private String selfIntroStrength;
    private String selfIntroWeakness;

    private String projectStrength;
    private String projectWeakness;

    private int totalScore;

    private String overallFeedback;

    private List<String> interviewQuestions;
}