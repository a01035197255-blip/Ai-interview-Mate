package io.github.seong5381.interviewMate.resume.controller;

import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.resume.dto.ResumeFeedbackCreateRequest;
import io.github.seong5381.interviewMate.resume.dto.ResumeFeedbackResponse;
import io.github.seong5381.interviewMate.resume.service.ResumeFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resume/feedbacks")
@RequiredArgsConstructor
public class ResumeFeedbackController {

    private final ResumeFeedbackService resumeFeedbackService;

    // ======================
    // 📌 CREATE (AI 평가 생성)
    // ======================
    @PostMapping
    public ResponseEntity<ApiResponse<ResumeFeedbackResponse>> create(
            @RequestBody ResumeFeedbackCreateRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        resumeFeedbackService.createFeedback(request.getResumeId())
                )
        );
    }

    // ======================
    // 📌 READ ONE (피드백 단건 조회)
    // ======================
    @GetMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeFeedbackResponse>> getFeedback(
            @PathVariable Long resumeId
    ) {

        ResumeFeedbackResponse response =
                resumeFeedbackService.getFeedback(resumeId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    // ======================
    // 📌 DELETE (피드백 삭제)
    // ======================
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(
            @PathVariable Long resumeId
    ) {
        resumeFeedbackService.deleteFeedback(resumeId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(null));
    }
}