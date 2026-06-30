package io.github.seong5381.interviewMate.feedback.dto;

import io.github.seong5381.interviewMate.feedback.entity.QnaSnapshot;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QnaSnapshotResponse {
    private Integer stepOrder;
    private String questionText;
    private String answerText;

    // 🚀 [추가] 프론트엔드로 AI 추천 답변 피드백을 실어 나를 필드
    private String aiRecommendation;
    private String aiModelAnswer;

    public static QnaSnapshotResponse from(QnaSnapshot snapshot) {
        return QnaSnapshotResponse.builder()
                .stepOrder(snapshot.getStepOrder())
                .questionText(snapshot.getQuestionText())
                .answerText(snapshot.getAnswerText())
                .aiRecommendation(snapshot.getAiRecommendation())
                .aiModelAnswer(snapshot.getAiModelAnswer())// 💡 엔티티에서 추출하여 DTO에 최종 바인딩
                .build();
    }
}