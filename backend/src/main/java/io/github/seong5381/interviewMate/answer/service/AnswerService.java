package io.github.seong5381.interviewMate.answer.service;

import io.github.seong5381.interviewMate.answer.dto.AnswerRequest;
import io.github.seong5381.interviewMate.answer.dto.AnswerResponse;
import io.github.seong5381.interviewMate.answer.entity.Answer;
import io.github.seong5381.interviewMate.answer.repository.AnswerRepository;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.question.entity.Question;
import io.github.seong5381.interviewMate.question.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    // =========================
    // 1. 답변 제출
    // =========================
    public AnswerResponse submit(AnswerRequest request) {

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.QUESTION_NOT_FOUND));

        Answer answer = Answer.builder()
                .question(question)
                .session(question.getSession())
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .answeredAt(LocalDateTime.now())
                .build();

        Answer saved = answerRepository.save(answer);

        return AnswerResponse.from(saved);
    }

    // =========================
    // 2. 질문 기준 답변 조회
    // =========================
    @Transactional(readOnly = true)
    public AnswerResponse getByQuestion(Long questionId) {

        Answer answer = answerRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ANSWER_NOT_FOUND));

        return AnswerResponse.from(answer);
    }

    // =========================
    // 3. 세션 전체 답변 조회
    // =========================
    @Transactional(readOnly = true)
    public List<AnswerResponse> getBySession(Long sessionId) {

        return answerRepository.findBySessionId(sessionId)
                .stream()
                .map(AnswerResponse::from)
                .toList();
    }

    // =========================
    // 4. 답변 개수
    // =========================
    public long countBySession(Long sessionId) {
        return answerRepository.countBySessionId(sessionId);
    }

    // =========================
    // 5. 평균 응답 시간
    // =========================
    public Double getAvgResponseTime(Long sessionId) {
        return answerRepository.findAverageResponseTime(sessionId);
    }
}