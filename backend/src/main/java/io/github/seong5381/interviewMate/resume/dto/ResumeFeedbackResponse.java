package io.github.seong5381.interviewMate.resume.dto;

import io.github.seong5381.interviewMate.resume.entity.ResumeFeedback;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "이력서 피드백 응답 DTO")
public class ResumeFeedbackResponse {

    @Schema(description = "피드백 ID", example = "10")
    private Long id;

    @Schema(description = "이력서 ID", example = "1")
    private Long resumeId;

    @Schema(description = "자기소개서 강점", example = "논리적인 구조와 경험 전달이 뛰어남")
    private String selfIntroStrength;

    @Schema(description = "자기소개서 약점", example = "구체적인 수치가 부족함")
    private String selfIntroWeakness;

    @Schema(description = "프로젝트 강점", example = "실무 경험이 잘 드러남")
    private String projectStrength;

    @Schema(description = "프로젝트 약점", example = "기술 선택 근거가 부족함")
    private String projectWeakness;

    @Schema(description = "총점", example = "85")
    private int totalScore;

    @Schema(description = "전체 피드백 요약", example = "전반적으로 우수하지만 기술 근거 보강 필요")
    private String overallFeedback;

    @Schema(description = "예상 면접 질문 리스트")
    private List<String> interviewQuestions;

    public static ResumeFeedbackResponse from(ResumeFeedback entity) {
        return ResumeFeedbackResponse.builder()
                .id(entity.getId())
                .resumeId(entity.getResume().getId())
                .selfIntroStrength(entity.getSelfIntroStrength())
                .selfIntroWeakness(entity.getSelfIntroWeakness())
                .projectStrength(entity.getProjectStrength())
                .projectWeakness(entity.getProjectWeakness())
                .totalScore(entity.getTotalScore())
                .overallFeedback(entity.getOverallFeedback())
                .interviewQuestions(entity.getInterviewQuestions())
                .build();
    }
}