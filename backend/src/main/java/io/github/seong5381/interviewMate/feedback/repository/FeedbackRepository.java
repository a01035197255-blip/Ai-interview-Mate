package io.github.seong5381.interviewMate.feedback.repository;

import io.github.seong5381.interviewMate.feedback.entity.Feedback;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findAllBySessionId(Long sessionId);

    Optional<Feedback> findBySessionId(Long sessionId);

    boolean existsBySessionId(Long sessionId);

    @Modifying
    @Query(value = "DELETE FROM feedback_qna_snapshot WHERE feedback_id = (SELECT f.id FROM feedback f WHERE f.session_id = :sessionId)", nativeQuery = true)
    void deleteSnapshotsByFeedbackId(@Param("sessionId") Long sessionId);

    @Modifying
    @Query("DELETE FROM Feedback f WHERE f.session.id = :sessionId")
    void deleteBySessionId(@Param("sessionId") Long sessionId);

}