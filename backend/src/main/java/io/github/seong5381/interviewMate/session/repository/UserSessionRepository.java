package io.github.seong5381.interviewMate.session.repository;

import io.github.seong5381.interviewMate.session.entity.Session;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSessionRepository
        extends JpaRepository<Session, Long> {

    Optional<Session> findByIdAndUserId(Long userId, Long sessionId);

    @Modifying
    @Query("DELETE FROM Session s WHERE s.id = :sessionId")
    void deleteBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.user.email = :email")
    long countSessionsByEmail(@Param("email") String email);

    @Query("SELECT AVG(f.totalScore) FROM Feedback f " +
            "JOIN f.session s " +
            "JOIN s.user u " +
            "WHERE u.email = :email")
    Double findAvgScoreByEmail(@Param("email") String email);
}