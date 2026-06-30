package io.github.seong5381.interviewMate.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiRecommendService {

    private final AiEvaluationService aiEvaluationService;

    /**
     * 🚀 특정 문항(질문+답변)을 기반으로 AI 맞춤형 출제 의도 및 개선 가이드라인을 동적으로 생성합니다.
     */
    public String createRecommendation(String questionText, String answerText) {
        if ("미응답".equals(answerText) || answerText.contains("중도 종료") || answerText.contains("Pass")) {
            return aiEvaluationService.generateNotUserAnswerQuestionGuide(questionText);
        }

        // LLM 프롬프트에게 문항 전용 피드백 가이드라인을 받아오도록 에이전트 호출
        return aiEvaluationService.generateQuestionGuide(questionText, answerText);
    }

    /**
     * 🚀 [추가] 지원자의 답변을 기반으로 면접장에서 바로 읊을 수 있는 '실전 구어체 모범 답변 예시'를 동적으로 생성합니다.
     */
    public String createModelAnswer(String questionText, String answerText) {
        if ("미응답".equals(answerText) || answerText.contains("중도 종료") || answerText.contains("Pass")) {
            return aiEvaluationService.generateNotUserAnswerQuestionGuide(questionText);
        }

        // aiEvaluationService 내부에 모범 답변용 프롬프트 생성 로직(generateModelAnswer)을 연동한다고 가정합니다.
        return aiEvaluationService.generateModelAnswer(questionText, answerText);
    }
}