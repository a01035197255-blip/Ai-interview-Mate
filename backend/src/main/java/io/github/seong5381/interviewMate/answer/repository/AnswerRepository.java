package io.github.seong5381.interviewMate.answer.repository;

import io.github.seong5381.interviewMate.answer.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    // =========================
    // 1. 질문 기준 답변 조회
    // =========================
    Optional<Answer> findByQuestionId(Long questionId);

    // =========================
    // 2. 특정 세션의 답변 전체 조회
    // =========================
    @Query("""
        SELECT a
        FROM Answer a
        JOIN a.question q
        WHERE q.session.id = :sessionId
        ORDER BY q.stepOrder ASC
    """)
    List<Answer> findBySessionId(@Param("sessionId") Long sessionId);

    // =========================
    // 3. 답변 개수 (세션 기준)
    // =========================
    @Query("""
        SELECT COUNT(a)
        FROM Answer a
        JOIN a.question q
        WHERE q.session.id = :sessionId
    """)
    long countBySessionId(@Param("sessionId") Long sessionId);

    // =========================
    // 4. 평균 응답 시간 (리포트용)
    // =========================
    @Query("""
        SELECT AVG(
            TIMESTAMPDIFF(SECOND, q.createdAt, a.createdAt)
        )
        FROM Answer a
        JOIN a.question q
        WHERE q.session.id = :sessionId
    """)
    Double findAverageResponseTime(@Param("sessionId") Long sessionId);

    boolean existsByQuestionId(Long id);

    @Query("SELECT a.question.id FROM Answer a WHERE a.question.id IN :questionIds")
    List<Long> findAnsweredQuestionIds(@Param("questionIds") List<Long> questionIds);

    void deleteBySessionId(Long sessionId);
}