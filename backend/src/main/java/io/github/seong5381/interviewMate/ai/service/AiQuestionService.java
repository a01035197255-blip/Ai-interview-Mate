package io.github.seong5381.interviewMate.ai.service;

import io.github.seong5381.interviewMate.setting.entity.Setting;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiQuestionService {

    private final ChatModel chatModel;

    // =========================
    // 🔥 10개 질문 생성 (핵심)
    // =========================
    public List<String> generate10Questions(Setting setting) {
        String prompt = build10QuestionPrompt(setting);
        String result = chatModel.call(prompt);
        return parseQuestions(result);
    }

    // =========================
    // 10개 질문 프롬프트
    // =========================
    private String build10QuestionPrompt(Setting setting) {
        return """
너는 대한민국 주요 대기업(S사, N사, K사 등) 및 글로벌 빅테크 기업에서 수많은 기술 면접을 진행한 10년 차 실무 면접관이자 시스템 아키텍트이다.

지원자의 직무, 경력, 회사 유형에 맞춰 실제 기업의 1차 실무 면접 및 2차 임원 면접에서 나올 법한 매우 날카롭고 변별력 높은 질문을 '정확히 10개' 생성하라.

질문 출제 방향 지침:
1. INTRO (1개): 단순 나열식 자기소개가 아닌, 입력된 직무에 특화된 핵심 기술 스택의 깊이와 대표 프로젝트의 성과가 두괄식으로 드러나는 구조적인 자기소개를 요구하라.
2. TECH (4개): 단순 이론 암기는 완벽히 배제하라. 대신 입력된 직무의 기술적 특성을 고려하여, 하단의 가변형 엔지니어링 장애 매트릭스에서 '서로 다른 4가지 차원'을 결합한 100%% 실전 시나리오 기반 질문을 출제하라. 고정된 기출문제를 반복하지 말고, 매 요청마다 새로운 장애 컨텍스트를 창조해야 한다. (질문 간 키워드 및 도메인 중복 절대 금지)
   - 가변형 엔지니어링 장애 매트릭스:
     * 차원 1 (데이터 및 상태 관리): 분산 캐싱 장애, 상태 동기화 레이스 컨디션, 데이터 누수 및 무결성 파괴 상황 중 택일
     * 차원 2 (동시성 및 자원 제어): 글로벌/분산 락 제어 실패, 스레드 풀 및 브라우저 메인 스레드 블로킹, 격리 수준 충돌 중 택일
     * 차원 3 (대규모 트래픽 및 렌더링/연산 성능): 대용량 데이터셋 적재 및 렌더링 병목, 아키텍처적 부하 분산 실패, 자원 임계치 오버헤드 중 택일
     * 차원 4 (도메인 아키텍처 및 마이그레이션 한계): 비즈니스 트랜잭션 실패 복구 가드, 기술 스택 패러다임 전환 시의 트레이드오프(Trade-off) 중 택일
   - 중요: 질문 생성 시, 위 매트릭스의 추상적 개념을 오직 입력된 직무 (예: 백엔드면 인프라/DB 레벨, 프론트엔드면 브라우저/클라이언트 런타임 레벨)의 실제 현업 장애 상황용 하이엔드 기술 용어로 치환하여 구체적인 질문을 빌드하라.
3. PERSONALITY (2개): "성격의 장단점" 같은 진부한 질문은 엄격히 금지한다. 글로벌 기업의 행동 기반 면접(STAR 기법)을 적용하되, 한 문항은 '기술적 방향성이나 아키텍처 설계를 두고 팀원과 대립했을 때 입력된 직무 관점의 객관적 데이터나 정량적 실험 지표로 설득한 경험', 다른 한 문항은 '제한된 일정 속에서 기술적 부채를 관리하며 돌파한 경험'으로 타겟을 완전히 분리하여 출제하라.
4. COMPANY (2개): 흔한 회사 칭찬은 감점 요인이다. 지원자가 선택한 회사 유형(대기업/스타트업/외국계)의 비즈니스적 특성(예: 대기업의 대규모 분산 환경과 거대 조직 얼라인먼트 / 스타트업의 제한된 리소스 속 초고속 MVP 릴리즈와 확장성 / 외국계의 글로벌 표준 아키텍처 및 매트릭스 협업)에 맞추어, 해당 회사 유형에서 입력된 직무 담당자가 실제 마주하게 될 고유한 엔지니어링적 챌린지를 이해하고 있는지 날카롭게 검증하라.
5. CLOSING (1개): 면접을 마무리하며 본인의 직무적 강점을 최종 어필하거나, 면접관인 시니어 시스템 아키텍트에게 역으로 던질 수 있는 해당 직무 분야의 수준 높은 기술적/비즈니스적 역질문을 유도하라.

지원자 정보:
- 직무: %s
- 경력: %s
- 회사 유형: %s

엄격한 규칙:
- 반드시 누락이나 초과 없이 '정확히 10개'의 질문만 생성하라.
- 질문 시작 부분에 번호(1.~10.)를 반드시 기입하라.
- 모든 질문은 자연스럽고 격식 있는 한국어 어미(~주세요, ~바랍니다, ~가요?)로 끝마쳐라.
- 질문 본문 내부나 문장 끝에 대괄호 기호 "[ ]" 나 지침용 식별 코드를 절대로 노출하거나 포함하지 마라.
- 질문 외에 서론, 결론, 설명, 인사말을 출력하는 것은 절대 금지한다. 오직 10개의 질문 리스트만 출력하라.
- 질문 간의 내용이 중복되거나 유사해서는 안 된다.

질문:
"""
                // 🚀 핵심 교정: 프롬프트 문자열 중간에 포함되어 형변환 예외를 유도하던
                // 순수 기호 성격의 % 문자들을 100%% 형태로 이스케이프(Escape) 가드 처리했습니다.
                .formatted(
                        setting.getJobType(),
                        setting.getExperienceLevel(),
                        setting.getCompanyType()
                );
    }

    // =========================
    // AI 응답 파싱
    // =========================
    private List<String> parseQuestions(String result) {
        if (result == null || result.isBlank()) {
            return List.of();
        }

        return Arrays.stream(result.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isBlank() && line.matches("^\\d+\\s*\\..*"))
                .map(line -> line.replaceFirst("^\\d+\\s*\\.\\s*", "").trim())
                .collect(Collectors.toList());
    }
}