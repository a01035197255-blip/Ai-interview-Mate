package io.github.seong5381.interviewMate.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.seong5381.interviewMate.ai.dto.AiScoreResponse;
import io.github.seong5381.interviewMate.answer.entity.Answer;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiEvaluationService {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    // =========================
    // AI 평가
    // =========================
    public AiScoreResponse evaluate(List<Answer> answers) {

        if (answers == null || answers.isEmpty()) {
            throw new BusinessException(ErrorCode.ANSWER_NOT_FOUND);
        }

        // ✔ 질문 전체 (중복 제거)
        String questionSummary = answers.stream()
                .map(a -> a.getQuestion().getAiQuestion())
                .distinct()
                .collect(Collectors.joining("\n"));

        // ✔ 답변 전체 정리
        String combinedAnswers = answers.stream()
                .map(Answer::getContent)
                .collect(Collectors.joining("\n"));

        // ✔ AI 호출
        String result = chatModel.call(buildPrompt(questionSummary, combinedAnswers));

        System.out.println("=== QUESTION ===");
        System.out.println(questionSummary);

        System.out.println("=== ANSWER ===");
        System.out.println(combinedAnswers);

        System.out.println("=== AI RESULT ===");
        System.out.println(result);

        // ✔ JSON 정리
        String cleaned = cleanJson(result);

        try {
            return objectMapper.readValue(cleaned, AiScoreResponse.class);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.AI_EVALUATION_PARSE_FAILED);
        }
    }

    // =========================
    // AI 답변 가이드 생성
    // =========================
    public String generateQuestionGuide(String questionText, String answerText) {
        if (questionText == null || questionText.isBlank()) {
            return "질문 정보가 유실되어 가이드를 생성할 수 없습니다.";
        }

        try {
            String prompt = buildQuestionGuidePrompt(questionText, answerText);
            String result = chatModel.call(prompt);

            if (result == null || result.isBlank()) {
                return "AI 분석을 완료하지 못했습니다.";
            }

            return result.trim();
        } catch (Exception e) {
            return "가이드라인을 분석하는 과정에서 일시적인 오버플로우가 발생했습니다. 종합 피드백 점수를 참고해 주세요.";
        }
    }

    public String generateNotUserAnswerQuestionGuide(String questionText) {
        if (questionText == null || questionText.isBlank()) {
            return "질문 정보가 유실되어 가이드를 생성할 수 없습니다.";
        }

        try {
            String prompt = buildQuestionGuideNotUserAnswerPrompt(questionText);
            String result = chatModel.call(prompt);

            if (result == null || result.isBlank()) {
                return "AI 분석을 완료하지 못했습니다.";
            }

            return result.trim();
        } catch (Exception e) {
            return "가이드라인을 분석하는 과정에서 일시적인 오버플로우가 발생했습니다. 종합 피드백 점수를 참고해 주세요.";
        }
    }

    public String generateModelAnswer(String questionText, String answerText) {
        if (questionText == null || questionText.isBlank()) {
            return "질문 정보가 유실되어 모범 답변을 생성할 수 없습니다.";
        }

        try {
            String prompt = buildModelAnswerPrompt(questionText, answerText);
            String result = chatModel.call(prompt);

            if (result == null || result.isBlank()) {
                return "AI 모범 답변을 생성하지 못했습니다.";
            }

            return result.trim();
        } catch (Exception e) {
            return "모범 답변을 구성하는 과정에서 일시적인 트래픽 오버헤드가 발생했습니다. 대시보드로 돌아가 재시도해 주세요.";
        }
    }

    public String generateNotUserAnswerModelAnswer(String questionText) {
        if (questionText == null || questionText.isBlank()) {
            return "질문 정보가 유실되어 모범 답변을 생성할 수 없습니다.";
        }

        try {
            String prompt = buildModelAnswerNotUserAnswerPrompt(questionText);
            String result = chatModel.call(prompt);

            if (result == null || result.isBlank()) {
                return "AI 모범 답변을 생성하지 못했습니다.";
            }

            return result.trim();
        } catch (Exception e) {
            return "모범 답변을 구성하는 과정에서 일시적인 트래픽 오버헤드가 발생했습니다. 대시보드로 돌아가 재시도해 주세요.";
        }
    }

    private String buildQuestionGuidePrompt(String question, String answer) {
        return """
        너는 대한민국 주요 대기업 및 글로벌 빅테크 기업에서 수많은 면접관을 교육한 10년 차 이상의 시니어 시스템 아키텍트이다.
        아래의 [면접 질문]과 지원자의 [실제 답변]을 기반으로, 이 질문이 요구하는 핵심 의도를 짚어내고 "어떻게 답변하면 면접관에게 확실한 고평가를 받을 수 있는지" 맞춤형 개선 가이드를 작성하라.

        [면접 질문]
        %s

        [실제 답변]
        %s

        [작성 규칙]
        1. 친절하면서도 전문적인 어조(~입니다, ~가 좋습니다)를 구사하라.
        2. 질문의 본질적인 기술 장벽(예: 동시성, 정합성, 트래픽 병목 등)을 짚어내라.
        3. 단순 암기식 답변을 넘어서 실제 실무에서 고려해야 할 '트레이드오프(Trade-off)'나 '구체적인 엔지니어링 접근 패턴'을 포함한 모범 가이드를 제시하라.
        4. 서론, 인사말, 사족, 마크다운(## 등)은 모두 배제하고 오직 3~4문장의 깔끔한 피드백 본문만 출력하라.

        AI 답변 가이드:
        """.formatted(question, answer);
    }

    private String buildQuestionGuideNotUserAnswerPrompt(String question) {
        return """
        너는 대한민국 주요 대기업 및 글로벌 빅테크 기업에서 수많은 면접관을 교육한 10년 차 이상의 시니어 시스템 아키텍트이다.
        아래의 [면접 질문]을 기반으로, 이 질문이 요구하는 핵심 의도를 짚어내고 "어떻게 답변하면 면접관에게 확실한 고평가를 받을 수 있는지" 맞춤형 개선 가이드를 작성하라.

        [면접 질문]
        %s

        [작성 규칙]
        1. 친절하면서도 전문적인 어조(~입니다, ~가 좋습니다)를 구사하라.
        2. 질문의 본질적인 기술 장벽(예: 동시성, 정합성, 트래픽 병목 등)을 짚어내라.
        3. 단순 암기식 답변을 넘어서 실제 실무에서 고려해야 할 '트레이드오프(Trade-off)'나 '구체적인 엔지니어링 접근 패턴'을 포함한 모범 가이드를 제시하라.
        4. 서론, 인사말, 사족, 마크다운(## 등)은 모두 배제하고 오직 3~4문장의 깔끔한 피드백 본문만 출력하라.

        AI 답변 가이드:
        """.formatted(question);
    }

    // =========================
    // 🚀 [추가] 모범 답변 전용 프롬프트 빌더
    // =========================
    private String buildModelAnswerPrompt(String question, String answer) {
        return """
        너는 대한민국 주요 대기업 및 글로벌 빅테크 기업에서 수많은 기술 면접 합격자를 배출한 10년 차 이상의 시니어 시스템 아키텍트이다.
        아래 [면접 질문]과 지원자의 [실제 답변]을 바탕으로, 지원자의 답변에 포함된 빈틈을 엔지니어링적으로 완벽히 보완하여 면접장에서 실제 말로 뱉을 수 있는 '최상급 수준의 구어체 모범 답변'을 1인칭 시점으로 작성하라.

        [면접 질문]
        %s

        [실제 답변]
        %s

        [작성 규칙]
        1. 반드시 면접장에서 직접 말하는 형태의 자연스러운 구어체("네, 해당 문제를 해결하기 위해~", "~라고 생각합니다.", "~했습니다.")로 작성하라.
        2. 기술적 정합성을 엄격히 지키되, 이론 나열에 그치지 말고 실제 프로덕션 환경의 트레이드오프(Trade-off)를 고려하여 주도적으로 문제를 돌파한 아키텍처적 경험이 드러나도록 서술하라.
        3. 결론을 먼저 제시하는 탄탄한 두괄식 구조(주장-근거-결론)로 콤팩트하게 작성하라.
        4. 면접관 인사, 사족, 설명, 큰따옴표 등의 마크다운 기호는 모두 걷어내고 오직 실전 스피치 대본 내용만 4~5문장 내외로 출력하라.

        AI 모범 답변 예시:
        """.formatted(question, answer);
    }

    private String buildModelAnswerNotUserAnswerPrompt(String question) {
        return """
        너는 대한민국 주요 대기업 및 글로벌 빅테크 기업에서 수많은 기술 면접 합격자를 배출한 10년 차 이상의 시니어 시스템 아키텍트이다.
        아래 [면접 질문]을 바탕으로, 지원자의 답변에 포함된 빈틈을 엔지니어링적으로 완벽히 보완하여 면접장에서 실제 말로 뱉을 수 있는 '최상급 수준의 구어체 모범 답변'을 1인칭 시점으로 작성하라.

        [면접 질문]
        %s

        [작성 규칙]
        1. 반드시 면접장에서 직접 말하는 형태의 자연스러운 구어체("네, 해당 문제를 해결하기 위해~", "~라고 생각합니다.", "~했습니다.")로 작성하라.
        2. 기술적 정합성을 엄격히 지키되, 이론 나열에 그치지 말고 실제 프로덕션 환경의 트레이드오프(Trade-off)를 고려하여 주도적으로 문제를 돌파한 아키텍처적 경험이 드러나도록 서술하라.
        3. 결론을 먼저 제시하는 탄탄한 두괄식 구조(주장-근거-결론)로 콤팩트하게 작성하라.
        4. 면접관 인사, 사족, 설명, 큰따옴표 등의 마크다운 기호는 모두 걷어내고 오직 실전 스피치 대본 내용만 4~5문장 내외로 출력하라.

        AI 모범 답변 예시:
        """.formatted(question);
    }

    // =========================
    // Prompt
    // =========================
    private String buildPrompt(String question, String answer) {
        return """
    너는 실무 경력 10년 이상의 시니어 기술 면접관이다.

    아래 질문과 답변을 기반으로 지원자를 객관적으로 평가하라.

    [질문]
    %s

    [답변]
    %s

    평가 기준

            1. technicalAccuracy (기술 정확성)
            - 핵심 기술 개념의 메커니즘과 내부 동작 원리를 정확히 알고 서술했는가
            - 피상적인 이론 암기를 넘어 기술 도입 시의 장단점 및 트레이드오프(Trade-off)를 인지하고 있는가
            - 실제 프로덕션(운영 환경) 레벨에 즉시 적용 가능한 수준의 정합성을 갖춘 답변인가
            
            2. logic (논리성)
            - 주장-근거-결론으로 이어지는 기술적 인과관계가 명확하고 꼬이지 않는가
            - 엔지니어링 측면에서 타당하고 공학적인 사실에 기반한 설득력 있는 근거를 제시했는가
            - 모순점이나 주관적인 추측성 주장을 배제하고 객관적 지표와 팩트를 바탕으로 전개했는가
            
            3. structure (구성력)
            - 핵심 결론을 가장 먼저 제시하여 전달하고자 하는 비즈니스/기술 포인트를 두괄식으로 파악했는가
            - 답변 속 다양한 아키텍처적 요소들이 뒤섞이지 않고 짜임새 있는 순서로 정리되었는가
            - 장황한 부연설명이나 미사여구를 걷어내고 질문의 본질에 맞추어 콤팩트하게 요약했는가
            
            4. communication (의사소통)
            - 현업 표준 기술 용어(Standard Technical Terminology)를 문맥에 맞춰 정확하게 구사했는가
            - 비유나 모호한 표현을 지양하고 본인의 의도와 설계를 직관적이고 명료하게 표현했는가
            - 실무 협업 및 코드 리뷰 컨텍스트에 걸맞은 격식 있고 프로페셔널한 전달력을 갖추었는가
            
            5. problemSolving (문제 해결 능력)
            - 질문에 포함된 기술적 병목(대용량 처리, 동시성 이슈, 장애 상황 등)의 근본 원인을 정확히 분석했는가
            - 단기적인 임시방편(Workaround)이 아닌 아키텍처 관점의 근본적인 엔지니어링 접근 방식을 제시했는가
            - 발생 가능한 예외 상황이나 에지 케이스(Edge case)에 대한 방어적 프로그래밍/설계 고려도가 포함되었는가

    각 항목은 반드시 0~100점으로 평가하라.

    종합 점수(totalScore) 계산 규칙

    totalScore =
    (technicalAccuracy +
     logic +
     structure +
     communication +
     problemSolving) / 5

    반드시 정수(Integer)로 반환하라.

    티어 기준

    S : 90 ~ 100
    A : 80 ~ 89
    B : 70 ~ 79
    C : 60 ~ 69
    D : 0 ~ 59

    tierDescription에는 해당 티어에 대한 평가를 1~2문장으로 작성하라.

    feedback:
    - 전체 면접 총평을 3~5문장으로 작성

    🔥 데이터 누락 방지 및 타입 준수 규칙
    1. 지원자가 답변을 하지 않았거나 중도 종료하여 평가할 내용이 없는 상황이라도, 출력 형식의 모든 키(Key) 값은 절대로 누락되거나 null 혹은 일반 문자열("")로 대체되어서는 안 된다.
    2. 특히 'strengths'와 'improvements' 필드는 항상 JSON 배열 형태([ ... ])를 엄격히 유지하라. 
    3. 만약 강점이나 개선점으로 적을 내용이 없다면, 빈 배열 `[]`을 반환하거나 `["중도 종료로 인해 강점을 평가할 수 없습니다."]`, `["중도 종료로 인해 개선점을 평가할 수 없습니다."]`와 같은 디폴트 안내 문장을 배열 내부에 채워 넣어라.

    중요 규칙

    - 반드시 JSON만 출력
    - JSON 외 문장 출력 금지
    - 설명 금지
    - 코드블럭 금지
    - 마크다운 금지
    - 모든 점수는 Integer
    - totalScore는 반드시 위 계산식대로 계산

    출력 형식
    {
      "problemSolving": 0,
      "technicalAccuracy": 0,
      "logic": 0,
      "structure": 0,
      "communication": 0,
      "totalScore": 0,
      "tier": "",
      "tierDescription": "",
      "feedback": "",
      "strengths": ["첫 번째 강점 내용", "두 번째 강점 내용"],
      "improvements": ["첫 번째 개선 영역", "두 번째 개선 영역"]
    }
    """.formatted(question, answer);
    }

    // =========================
    // JSON 안정화
    // =========================
    private String cleanJson(String result) {
        if (result == null) {
            throw new BusinessException(ErrorCode.AI_EVALUATION_PARSE_FAILED);
        }

        return result
                .replace("```json", "")
                .replace("```", "")
                                .trim();
    }
}