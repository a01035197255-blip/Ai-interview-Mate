package io.github.seong5381.interviewMate.question.repository;

import io.github.seong5381.interviewMate.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    // =========================
    // 1. 세션 전체 질문 조회
    // =========================
    List<Question> findBySessionIdOrderByStepOrderAsc(Long sessionId);

    // =========================
    // 2. 특정 STEP 질문 조회
    // =========================

    // =========================
    // 3. 현재 질문 (index 기반이면 optional)
    // =========================
    Optional<Question> findBySessionIdAndStepOrder(Long sessionId, Integer stepOrder);

    // =========================
    // 6. 전체 질문 개수
    // =========================
    long countBySessionId(Long sessionId);

    boolean existsBySessionId(Long sessionId);

    Optional<Question>
    findFirstBySession_IdAndStepOrderGreaterThanOrderByStepOrderAsc(
            Long sessionId,
            Integer stepOrder
    );

    Optional<Question>
    findFirstBySession_IdAndStepOrderLessThanOrderByStepOrderDesc(
            Long sessionId,
            Integer stepOrder
    );

    void deleteBySessionId(Long sessionId);
}