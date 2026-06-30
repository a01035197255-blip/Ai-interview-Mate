package io.github.seong5381.interviewMate.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.seong5381.interviewMate.ai.dto.ResumeFeedbackAIResult;
import io.github.seong5381.interviewMate.ai.service.AiService;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.resume.dto.ResumeFeedbackResponse;
import io.github.seong5381.interviewMate.resume.entity.Resume;
import io.github.seong5381.interviewMate.resume.entity.ResumeFeedback;
import io.github.seong5381.interviewMate.resume.repository.ResumeFeedbackRepository;
import io.github.seong5381.interviewMate.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResumeFeedbackService {

    private final ResumeRepository resumeRepository;
    private final ResumeFeedbackRepository feedbackRepository;
    private final AiService aiService;

    // =========================
    // 🔥 생성 (AI → Entity → DB → Response)
    // =========================
    @Transactional
    public ResumeFeedbackResponse createFeedback(Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));

        // ✔️ 1차 방어: 이미 있으면 즉시 반환 (여기서도 질문을 같이 긁어와야 에러가 안 납니다)
        Optional<ResumeFeedback> existing = feedbackRepository.findByResume_IdWithQuestions(resumeId);

        if (existing.isPresent()) {
            return ResumeFeedbackResponse.from(existing.get());
        }

        // ✔️ AI 생성
        ResumeFeedbackAIResult dto;

        try {
            dto = aiService.generateFeedback(resume);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.AI_EVALUATION_PARSE_FAILED);
        }

        ResumeFeedback feedback = ResumeFeedback.builder()
                .resume(resume)
                .selfIntroStrength(dto.getSelfIntroStrength())
                .selfIntroWeakness(dto.getSelfIntroWeakness())
                .projectStrength(dto.getProjectStrength())
                .projectWeakness(dto.getProjectWeakness())
                .totalScore(dto.getTotalScore())
                .overallFeedback(dto.getOverallFeedback())
                .interviewQuestions(dto.getInterviewQuestions())
                .build();

        ResumeFeedback saved = feedbackRepository.save(feedback);

        // 엔티티 구조에 따라 save 직후 연관관계 조회가 필요할 수 있으므로 안전하게 다시 한 번 조회하거나 변환 처리
        return ResumeFeedbackResponse.from(saved);
    }

    // =========================
    // 🔥 단건 조회 (500 에러 해결 지점)
    // =========================
    @Transactional(readOnly = true)
    public ResumeFeedbackResponse getFeedback(Long resumeId) {

        // 💡 [수정] findByResume_Id -> findByResume_IdWithQuestions 로 변경
        ResumeFeedback feedback = feedbackRepository.findByResume_IdWithQuestions(resumeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FEEDBACK_NOT_FOUND));

        // 이제 DB에서 질문 리스트까지 완전히 한 몸으로 들고 왔기 때문에
        // DTO로 변환할 때 500 에러(no session)가 원천 봉쇄됩니다.
        return ResumeFeedbackResponse.from(feedback);
    }

    @Transactional
    public void deleteFeedback(Long resumeId){

        ResumeFeedback feedback = feedbackRepository.findByResume_Id(resumeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));

        feedbackRepository.delete(feedback);
    }
}