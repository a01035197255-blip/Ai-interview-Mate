package io.github.seong5381.interviewMate.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.seong5381.interviewMate.ai.dto.ResumeFeedbackAIResult;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.resume.entity.Resume;
import io.github.seong5381.interviewMate.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    // =========================
    // 🔥 Resume 피드백 생성
    // =========================
    public ResumeFeedbackAIResult generateFeedback(Resume resume) {

        String resumeText =
                Optional.ofNullable(resume.getSelfIntro()).orElse("") + "\n" +
                        Optional.ofNullable(resume.getProjectIntro()).orElse("");

        String prompt = buildFeedbackPrompt(resumeText);

        String aiResult = chatModel.call(prompt);

        log.error("RAW RESPONSE >>> {}", aiResult);

        aiResult = aiResult
                .replace("```json", "")
                .replace("```", "")
                .trim();

        // 🔥 JSON만 잘라내기 (핵심)
        int start = aiResult.indexOf("{");
        int end = aiResult.lastIndexOf("}");

        if (start == -1 || end == -1 || end <= start) {
            log.error("INVALID JSON RESPONSE >>> {}", aiResult);
            throw new BusinessException(ErrorCode.AI_EVALUATION_PARSE_FAILED);
        }

        aiResult = aiResult.substring(start, end + 1);
        try {
            return objectMapper.readValue(aiResult, ResumeFeedbackAIResult.class);

        } catch (Exception e) {
            log.error("PARSE FAILED JSON >>> {}", aiResult);
            throw new BusinessException(ErrorCode.AI_EVALUATION_PARSE_FAILED);
        }
    }

    // =========================
    // 🔥 프롬프트 생성
    // =========================
    private String buildFeedbackPrompt(String resumeText) {
        return """
        너는 10년 이상의 경력을 가진 시니어 기술 면접관이다.

        사용자의 지원서를 분석하여 반드시 "순수 JSON"으로만 응답하라.
        설명, 코드블록, 마크다운 절대 금지.
        
        - JSON 외 어떤 텍스트도 절대 출력 금지
        - 코드블록 금지
        - 설명 금지
        - 반드시 { 로 시작, } 로 끝

        =========================
        📌 출력 JSON 구조 (고정)
        =========================
        {
          "selfIntroStrength": "",
          "selfIntroWeakness": "",
          "projectStrength": "",
          "projectWeakness": "",
          "totalScore": 0,
          "overallFeedback": "",
          "interviewQuestions": [
            "",
            "",
            "",
            "",
            ""
          ]
        }
        
        =========================
        📌 ⚠️ 반드시 지켜야 할 출력 길이 규칙
        =========================
        1. selfIntroStrength / selfIntroWeakness
           - 최소 3줄 이상 작성
           - 이상한 말은 설명만
       
        2. projectStrength / projectWeakness
           - 최소 3줄 이상 작성
           - 이상한 말은 설명만
        
        3. overallFeedback
           - 최소 4줄 이상 작성
           - 이상한 말은 설명만
        
        =========================
        📌 평가 기준 (엄격 적용)
        =========================
        1. 자기소개 구체성 및 진정성
        2. 프로젝트 경험의 실무성
        3. 기술 스택 적합성
        4. 문제 해결 능력
        5. 커뮤니케이션 능력

        =========================
        📌 점수 기준 (0~100)
        =========================
        - 90~100: 실무 즉시 투입 가능 수준
        - 80~89: 상위권 지원자
        - 70~79: 평균 이상
        - 60~69: 보완 필요
        - 0~59: 많이 부족

        =========================
        📌 질문 생성 규칙
        =========================
        - 실제 기술 면접에서 나올 질문만 생성
        - 너무 쉬운 질문 금지
        - 지원서 기반 맞춤 질문 생성
        - 반드시 5개 생성

        =========================
        📌 전체 평가 스타일
        =========================
        - 간결하고 실무 중심
        - 감정 표현 금지
        - 면접관 시점 유지
        =========================
        📌 다음 경우 총점은 0~30점으로 제한하라:
        =========================
        - 의미 없는 문자 입력
        - 문장 구조가 없음
        - 한국어/영어 문장이 아닌 경우
        - 분석 가능한 내용이 없음
        =========================
        📌 지원서 내용
        =========================
        %s
        """.formatted(resumeText);
    }
}