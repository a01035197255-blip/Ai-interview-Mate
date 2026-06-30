package io.github.seong5381.interviewMate.resume.service;


import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.resume.dto.ResumeCreateRequest;
import io.github.seong5381.interviewMate.resume.dto.ResumeResponse;
import io.github.seong5381.interviewMate.resume.entity.Resume;
import io.github.seong5381.interviewMate.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    // ======================
    // 📌 CREATE
    // ======================
    public ResumeResponse create(ResumeCreateRequest request , String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        Resume resume = Resume.builder()
                .user(user)
                .age(request.getAge())
                .gender(request.getGender())
                .phone(request.getPhone())
                .address(request.getAddress())
                .summary(request.getSummary())
                .selfIntro(request.getSelfIntro())
                .career(request.getCareer())
                .projectIntro(request.getProjectIntro())
                .skills(request.getSkills())
                .education(request.getEducation())
                .build();

        Resume saved = resumeRepository.save(resume);

        return ResumeResponse.from(saved);
    }

    // ======================
    // 📌 READ ALL
    // ======================
    public List<ResumeResponse> findAll(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));
        return resumeRepository.findByUserEmail(user.getEmail())
                .stream()
                .map(ResumeResponse::from)
                .collect(toList());
    }

    // ======================
    // 📌 READ ONE
    // ======================
    public ResumeResponse findById(Long id) {

        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));

        return ResumeResponse.from(resume);
    }

    // ======================
    // 📌 UPDATE
    // ======================
    public ResumeResponse  update(Long id, ResumeCreateRequest request) {

        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));

        resume.setAge(request.getAge());
        resume.setGender(request.getGender());
        resume.setPhone(request.getPhone());
        resume.setAddress(request.getAddress());
        resume.setSummary(request.getSummary());
        resume.setSelfIntro(request.getSelfIntro());
        resume.setCareer(request.getCareer());
        resume.setProjectIntro(request.getProjectIntro());
        resume.setSkills(request.getSkills());
        resume.setEducation(request.getEducation());

        Resume updated = resumeRepository.save(resume);

        return ResumeResponse.from(updated);
    }

    // ======================
    // 📌 DELETE
    // ======================
    public void delete(Long id) {
        resumeRepository.deleteById(id);
    }
}