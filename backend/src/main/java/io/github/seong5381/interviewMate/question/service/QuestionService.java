package io.github.seong5381.interviewMate.question.service;

import io.github.seong5381.interviewMate.ai.service.AiChatService;
import io.github.seong5381.interviewMate.ai.service.AiQuestionService;
import io.github.seong5381.interviewMate.answer.entity.Answer;
import io.github.seong5381.interviewMate.answer.repository.AnswerRepository;
import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.question.dto.QuestionGenerateRequest;
import io.github.seong5381.interviewMate.question.dto.QuestionRequestDto;
import io.github.seong5381.interviewMate.question.dto.QuestionResponse;
import io.github.seong5381.interviewMate.question.dto.QuestionResponseDto;
import io.github.seong5381.interviewMate.question.entity.Question;
import io.github.seong5381.interviewMate.question.repository.QuestionRepository;
import io.github.seong5381.interviewMate.session.entity.Session;
import io.github.seong5381.interviewMate.session.repository.UserSessionRepository;
import io.github.seong5381.interviewMate.setting.entity.Setting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;
    private final AiQuestionService aiQuestionService;
    private final AnswerRepository answerRepository;
    private final AiChatService aiChatService;

    // =========================
    // 1. AI 10문항 생성 (중복 방지 락 강화 🚀)
    // =========================
    @Transactional
    public List<QuestionResponse> generate(QuestionGenerateRequest request, String email) {

        // 💡 1. 본인 소유의 올바른 세션인지 먼저 철저하게 검증합니다.
        Session session = getSession(request.getSessionId(), email);

        // 💡 2. [핵심 방어] 이미 이 세션에 대해 생성된 질문 리스트가 디비에 있는지 체크합니다.
        if (existsBySessionId(session.getId())) {
            // 이미 생성되어 있다면, AI API를 또 찌르지 않고 디비에 이미 저장된 10개의 질문 풀을 그대로 긁어와 리턴합니다.
            return getBySession(session.getId());
        }

        Setting setting = session.getSetting();

        // 외부 AI 호출 (블로킹 구간: 3~5초 소요됨)
        List<String> aiQuestions = aiQuestionService.generate10Questions(setting);

        List<Question> questions = new ArrayList<>();

        for (int i = 0; i < aiQuestions.size(); i++) {
            Question q = Question.builder()
                    .session(session)
                    .stepOrder(i + 1)
                    .aiQuestion(aiQuestions.get(i))
                    .createdAt(LocalDateTime.now())
                    .build();

            questions.add(q);
        }

        return questionRepository.saveAll(questions)
                .stream()
                .map(QuestionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionResponse pass(Long sessionId, Integer stepOrder) {
        // ① 패스할 현재 문항 객체를 먼저 정확히 긁어옵니다.
        Question currentQuestion = questionRepository
                .findFirstBySession_IdAndStepOrderGreaterThanOrderByStepOrderAsc(sessionId, stepOrder - 1)
                .orElseThrow(() -> new BusinessException(ErrorCode.QUESTION_NOT_FOUND));

        // ② 중복으로 패스 데이터가 들어가는 현상을 막기 위해 기존 답변이 없는 경우에만 저장 처리 가드를 칩니다.
        boolean alreadyAnswered = answerRepository.existsByQuestionId(currentQuestion.getId());
        if (!alreadyAnswered) {
            Answer passAnswer = Answer.builder()
                    .session(currentQuestion.getSession())
                    .question(currentQuestion)
                    .content("잘 모르겠습니다. (Pass)") // 💡 프롬프트가 분석할 때 인식할 패스 더미 문자열 세팅
                    .createdAt(LocalDateTime.now())
                    .build();
            answerRepository.save(passAnswer);
        }

        // ③ 답변을 강제 기록했으니 순리대로 바로 다음 질문 문항을 꺼내어 반환합니다.
        return getNext(sessionId, stepOrder);
    }

    @Transactional
    public void terminateAllRemainingQuestions(Long sessionId) {
        // ① 해당 세션의 모든 질문 목록을 순서대로 가져옵니다.
        List<Question> allQuestions = questionRepository.findBySessionIdOrderByStepOrderAsc(sessionId);

        // ② 이미 답변이 존재하는 질문 ID 목록을 한 번에 조회합니다. (N+1 문제 방지 및 최적화)
        // answerRepository에 List<Long> questionIds를 받아 이미 존재하는 ID만 반환하는 쿼리가 있다고 가정합니다.
        List<Long> questionIds = allQuestions.stream().map(Question::getId).toList();
        List<Long> alreadyAnsweredIds = answerRepository.findAnsweredQuestionIds(questionIds);

        List<Answer> passAnswers = new ArrayList<>();

        for (Question question : allQuestions) {
            // ③ 기존 답변이 없는 질문에만 "중도 종료" 더미 답변 생성
            if (!alreadyAnsweredIds.contains(question.getId())) {
                Answer passAnswer = Answer.builder()
                        .session(question.getSession())
                        .question(question)
                        .content("중도 종료")
                        .createdAt(LocalDateTime.now())
                        .build();
                passAnswers.add(passAnswer);
            }
        }

        // ④ 한 번에 대량 저장 (saveAll로 쿼리 최적화)
        if (!passAnswers.isEmpty()) {
            answerRepository.saveAll(passAnswers);
        }
    }

    // =========================
    // 2. 전체 질문 조회
    // =========================
    @Transactional(readOnly = true)
    public List<QuestionResponse> getBySession(Long sessionId) {
        return questionRepository.findBySessionIdOrderByStepOrderAsc(sessionId)
                .stream()
                .map(QuestionResponse::from)
                .collect(Collectors.toList());
    }

    // =========================
    // 추가 툴: 특정 세션의 첫 번째 질문만 단건 조회 (시작 API 호출용 가이드)
    // =========================
    @Transactional(readOnly = true)
    public QuestionResponse getFirstQuestion(Long sessionId) {
        return questionRepository
                .findFirstBySession_IdAndStepOrderGreaterThanOrderByStepOrderAsc(sessionId, 0) // 0보다 큰 첫 번째 = 1번 질문
                .map(QuestionResponse::from)
                .orElseThrow(() -> new BusinessException(ErrorCode.QUESTION_NOT_FOUND));
    }

    // =========================
    // 추가 툴: 해당 세션에 이미 질문 풀이 인서트 되었는지 여부 검사 🔍
    // =========================
    @Transactional(readOnly = true)
    public boolean existsBySessionId(Long sessionId) {
        // 내부 Repository 인터페이스에 기본 제공되는 exists 기능을 맵핑합니다.
        return questionRepository.existsBySessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public QuestionResponse getNext(Long sessionId, Integer stepOrder) {
        return questionRepository
                .findFirstBySession_IdAndStepOrderGreaterThanOrderByStepOrderAsc(
                        sessionId,
                        stepOrder
                )
                .map(QuestionResponse::from)
                .orElse(null);
    }



    @Transactional(readOnly = true)
    public QuestionResponse getPrev(Long sessionId, Integer stepOrder) {
        return questionRepository
                .findFirstBySession_IdAndStepOrderLessThanOrderByStepOrderDesc(
                        sessionId,
                        stepOrder
                )
                .map(QuestionResponse::from)
                .orElse(null);
    }


    @Transactional(readOnly = true)
    public Question getById(Long questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.QUESTION_NOT_FOUND)
                );
    }

    private Session getSession(Long sessionId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        return userSessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
    }

    public QuestionResponseDto askQuestion(String email, QuestionRequestDto requestDto) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.USER_NOT_FOUND,
                        ErrorCode.USER_NOT_FOUND.getStatus()
                ));

        String question = requestDto.getQuestion();

        // 1. AI 호출 (사용자 질문 기반)
        String answer = aiChatService.getAnswer(question);

        // 2. 응답 반환
        return new QuestionResponseDto(question, answer);
    }
}