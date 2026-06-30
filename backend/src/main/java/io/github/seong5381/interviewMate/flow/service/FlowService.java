package io.github.seong5381.interviewMate.flow.service;

import io.github.seong5381.interviewMate.answer.dto.AnswerRequest;
import io.github.seong5381.interviewMate.answer.service.AnswerService;
import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.flow.dto.ProgressResponse;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.question.dto.QuestionGenerateRequest;
import io.github.seong5381.interviewMate.question.dto.QuestionResponse;
import io.github.seong5381.interviewMate.question.entity.Question;
import io.github.seong5381.interviewMate.question.service.QuestionService;
import io.github.seong5381.interviewMate.session.entity.Session;
import io.github.seong5381.interviewMate.session.entity.SessionStatus;
import io.github.seong5381.interviewMate.session.repository.UserSessionRepository;
import io.github.seong5381.interviewMate.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FlowService {

    private final SessionService sessionService;
    private final QuestionService questionService;
    private final AnswerService answerService;
    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;

    public QuestionResponse startInterview(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        if (session.getStatus() == SessionStatus.DONE || session.getStatus() == SessionStatus.TERMINATED) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_DONE);
        }

        session.start();

        if (questionService.existsBySessionId(sessionId)) {
            return questionService.getFirstQuestion(sessionId);
        }

        QuestionGenerateRequest request = new QuestionGenerateRequest();
        request.setSessionId(sessionId);

        List<QuestionResponse> questions = questionService.generate(request, email);

        return questions.isEmpty() ? null : questions.get(0);
    }

    @Transactional(readOnly = true)
    public QuestionResponse next(Long sessionId, Integer stepOrder, String email) {
        Session session = getSession(sessionId, email);
        return questionService.getNext(session.getId(), stepOrder);
    }

    @Transactional(readOnly = true)
    public QuestionResponse prev(Long sessionId, Integer stepOrder, String email) {
        Session session = getSession(sessionId, email);
        return questionService.getPrev(session.getId(), stepOrder);
    }

    public QuestionResponse pass(Long sessionId, Integer stepOrder, String email) {
        Session session = getSession(sessionId, email);
        return questionService.pass(session.getId(), stepOrder);
    }

    public QuestionResponse submitAnswerAndNext(AnswerRequest request, String email) {
        Session session = getSession(request.getSessionId(), email);

        // 답변 테이블 인서트
        answerService.submit(request);

        Question question = questionService.getById(request.getQuestionId());

        return questionService.getNext(
                session.getId(),
                question.getStepOrder()
        );
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestions(Long sessionId) {
        return questionService.getBySession(sessionId);
    }

    @Transactional(readOnly = true)
    public ProgressResponse getProgress(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        long total = questionService.getBySession(session.getId()).size();
        long answered = answerService.countBySession(session.getId());

        int progress = total == 0 ? 0 : (int) ((answered * 100) / total);

        return new ProgressResponse(answered, total, progress);
    }

    @Transactional(readOnly = true)
    public boolean isFinished(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);
        long answered = answerService.countBySession(session.getId());

        if (answered >= 10) {
            return true;
        }

        return sessionService.isTimeOver(session);
    }

    public void terminateInterview(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        if (session.getStatus() == SessionStatus.DONE || session.getStatus() == SessionStatus.TERMINATED) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_DONE);
        }

        questionService.terminateAllRemainingQuestions(sessionId);

        session.terminate();
    }

    public void finishInterview(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        if (session.getStatus() == SessionStatus.DONE) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_DONE);
        }

        session.finish();
    }

    private Session getSession(Long sessionId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        return userSessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
    }
}
