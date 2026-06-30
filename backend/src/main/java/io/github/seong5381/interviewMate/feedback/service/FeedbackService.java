package io.github.seong5381.interviewMate.feedback.service;

import io.github.seong5381.interviewMate.ai.dto.AiScoreResponse;
import io.github.seong5381.interviewMate.ai.service.AiEvaluationService;
import io.github.seong5381.interviewMate.ai.service.AiRecommendService;
import io.github.seong5381.interviewMate.answer.entity.Answer;
import io.github.seong5381.interviewMate.answer.repository.AnswerRepository;
import io.github.seong5381.interviewMate.feedback.dto.*;
import io.github.seong5381.interviewMate.feedback.entity.Feedback;
import io.github.seong5381.interviewMate.feedback.entity.QnaSnapshot;
import io.github.seong5381.interviewMate.feedback.repository.FeedbackRepository;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.question.entity.Question;
import io.github.seong5381.interviewMate.question.repository.QuestionRepository;
import io.github.seong5381.interviewMate.session.entity.Session;
import io.github.seong5381.interviewMate.session.repository.UserSessionRepository;
import io.github.seong5381.interviewMate.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final AiEvaluationService aiEvaluationService;
    private final SessionService sessionService;
    private final UserSessionRepository userSessionRepository;
    private final AiRecommendService aiRecommendService;

    public FeedbackResponse generate(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        var existingFeedbackOpt = feedbackRepository.findBySessionId(session.getId());
        if (existingFeedbackOpt.isPresent()) {
            return FeedbackResponse.from(existingFeedbackOpt.get());
        }

        return createNewFeedback(session);
    }

    private FeedbackResponse createNewFeedback(Session session) {
        List<Answer> answers = answerRepository.findBySessionId(session.getId());
        AiScoreResponse result = aiEvaluationService.evaluate(answers);
        List<Question> questions = questionRepository.findBySessionIdOrderByStepOrderAsc(session.getId());

        List<QnaSnapshot> qnaSnapshots = questions.stream()
                .map(q -> createSnapshot(q, answers))
                .collect(Collectors.toList());

        Feedback feedback = Feedback.createFeedback(session, result, qnaSnapshots);
        Feedback saved = feedbackRepository.saveAndFlush(feedback);

        answerRepository.deleteBySessionId(session.getId());
        questionRepository.deleteBySessionId(session.getId());

        return FeedbackResponse.from(saved);
    }

    private QnaSnapshot createSnapshot(Question question, List<Answer> answers) {
        String answerText = answers.stream()
                .filter(a -> a.getQuestion().getId().equals(question.getId()))
                .findFirst()
                .map(Answer::getContent)
                .orElse("미응답");

        String aiRecommendation = aiRecommendService.createRecommendation(question.getAiQuestion(), answerText);
        String aiModelAnswer = aiRecommendService.createModelAnswer(question.getAiQuestion(), answerText);

        return QnaSnapshot.builder()
                .stepOrder(question.getStepOrder())
                .questionText(question.getAiQuestion())
                .answerText(answerText)
                .aiRecommendation(aiRecommendation)
                .aiModelAnswer(aiModelAnswer)
                .build();
    }

    public void updateReportTitle(Long sessionId, String title, String email) {
        sessionService.getSessionInternal(sessionId, email);

        Feedback feedback = feedbackRepository.findAllBySessionId(sessionId).stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.FEEDBACK_NOT_FOUND));

        feedback.updateTitle(title);
    }

    @Transactional(readOnly = true)
    public List<HistoryResponse> getInterviewHistory(String email) {
        return feedbackRepository.findAll().stream()
                .filter(f -> f.getSession().getUser().getEmail().equals(email))
                .map(f -> HistoryResponse.builder()
                        .id(f.getSession().getId())
                        .title(f.getTitle())
                        .score(f.getTotalScore())
                        .duration(formatDuration(f.getSession()))
                        .createdAt(f.getCreatedAt())
                        .build())
                .sorted((h1, h2) -> h2.getCreatedAt().compareTo(h1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResultResponse getResult(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        Feedback feedback = feedbackRepository.findAllBySessionId(sessionId).stream().findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.FEEDBACK_NOT_FOUND));

        return ResultResponse.builder()
                .title(feedback.getTitle())
                .totalScore(feedback.getTotalScore())
                .tier(feedback.getTier())
                .strengths(parse(feedback.getStrengths()))
                .improvements(parse(feedback.getImprovements()))
                .totalTime(formatDuration(session))
                .passedCount(calculatePassedCount(feedback))
                .technicalAccuracy(feedback.getTechnicalAccuracy())
                .logic(feedback.getLogic())
                .structure(feedback.getStructure())
                .communication(feedback.getCommunication())
                .problemSolving(feedback.getProblemSolving())
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse getReport(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        Feedback feedback = feedbackRepository.findAllBySessionId(session.getId()).stream().findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.FEEDBACK_NOT_FOUND));

        double passRate = (feedback.getTechnicalAccuracy() + feedback.getLogic() + feedback.getStructure()
                + feedback.getCommunication() + feedback.getProblemSolving()) / 5.0;

        List<QnaSnapshotResponse> snapshotResponses = feedback.getQnaSnapshots().stream()
                .map(QnaSnapshotResponse::from)
                .collect(Collectors.toList());

        return ReportResponse.builder()
                .title(feedback.getTitle())
                .totalScore(feedback.getTotalScore())
                .passRate(passRate)
                .tier(feedback.getTier())
                .tierDescription(feedback.getTierDescription())
                .technicalAccuracy(feedback.getTechnicalAccuracy())
                .logic(feedback.getLogic())
                .structure(feedback.getStructure())
                .communication(feedback.getCommunication())
                .problemSolving(feedback.getProblemSolving())
                .summary(feedback.getFeedback())
                .strengths(parse(feedback.getStrengths()))
                .improvements(parse(feedback.getImprovements()))
                .qnaSnapshots(snapshotResponses)
                .build();
    }

    private String formatDuration(Session session) {
        if (session.getStartTime() == null || session.getEndTime() == null) return "00:00";
        long seconds = Duration.between(session.getStartTime(), session.getEndTime()).toSeconds();
        return String.format("%02d:%02d", seconds / 60, seconds % 60);
    }

    private int calculatePassedCount(Feedback feedback) {
        return (int) feedback.getQnaSnapshots().stream()
                .filter(q -> {
                    String answer = q.getAnswerText();
                    return answer == null || answer.equals("미응답") || answer.contains("중도 종료") || answer.contains("Pass");
                })
                .count();
    }

    private List<String> parse(String value) {
        if (value == null || value.isBlank()) return List.of();
        return List.of(value.split("\\|\\|"));
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getBySession(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);
        return feedbackRepository.findAllBySessionId(session.getId()).stream()
                .map(FeedbackResponse::from)
                .collect(Collectors.toList());
    }

    public void deleteFeedback(Long sessionId, String email) {
        Session session = sessionService.getSessionInternal(sessionId, email);

        feedbackRepository.deleteSnapshotsByFeedbackId(session.getId());
        feedbackRepository.deleteBySessionId(session.getId());
        answerRepository.deleteBySessionId(session.getId());
        questionRepository.deleteBySessionId(session.getId());
        userSessionRepository.deleteBySessionId(session.getId());
    }
}