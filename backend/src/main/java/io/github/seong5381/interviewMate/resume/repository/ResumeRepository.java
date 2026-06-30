package io.github.seong5381.interviewMate.resume.repository;

import io.github.seong5381.interviewMate.resume.entity.Resume;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserId(Long userId);
    @Query("select r from Resume r join fetch r.user where r.user.email = :userEmail")
    List<Resume> findByUserEmail(@Param("userEmail") String userEmail);
}
