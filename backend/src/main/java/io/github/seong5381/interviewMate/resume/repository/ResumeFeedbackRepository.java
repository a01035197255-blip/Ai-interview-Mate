package io.github.seong5381.interviewMate.resume.repository;

import io.github.seong5381.interviewMate.resume.entity.ResumeFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ResumeFeedbackRepository extends JpaRepository<ResumeFeedback, Long> {

    // 💡 기존 메서드
    Optional<ResumeFeedback> findByResume_Id(Long resumeId);

    // 💡 [새로 추가] interviewQuestions까지 한 번에 묶어서 긁어오는 쿼리
    @Query("select rf from ResumeFeedback rf join fetch rf.interviewQuestions where rf.resume.id = :resumeId")
    Optional<ResumeFeedback> findByResume_IdWithQuestions(@Param("resumeId") Long resumeId);
}