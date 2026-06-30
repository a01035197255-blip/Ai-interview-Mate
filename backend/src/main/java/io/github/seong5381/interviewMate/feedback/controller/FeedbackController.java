package io.github.seong5381.interviewMate.feedback.controller;

import io.github.seong5381.interviewMate.feedback.dto.*;
import io.github.seong5381.interviewMate.feedback.service.FeedbackService;
import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    // 🔥 면접 종료 후 AI 평가 최초 생성
    @PostMapping("/generate/{sessionId}")
    public ResponseEntity<ApiResponse<FeedbackResponse>> generate(@PathVariable Long sessionId,
                                                                  @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(feedbackService.generate(sessionId, userDetail.getUser().getEmail())));
    }

    // 🔥 🚀 [추가] 결과창에서 사용자가 면접 이름을 설정하고 저장할 때 호출되는 API
    @PatchMapping("/title/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> updateTitle(@PathVariable Long sessionId,
                                                         @RequestBody TitleUpdateRequest request, // 💡 단건 수신용 DTO
                                                         @AuthenticationPrincipal UserDetail userDetail) {
        feedbackService.updateReportTitle(sessionId, request.getTitle(), userDetail.getUser().getEmail());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    // 🔥 🚀 [추가] 연습 기록(History) 전체 목록 페이지 연동 API
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<HistoryResponse>>> getHistory(@AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(feedbackService.getInterviewHistory(userDetail.getUser().getEmail())));
    }

    // 세션 기준 Feedback 원본 조회
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> get(@PathVariable Long sessionId,
                                                                   @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(feedbackService.getBySession(sessionId, userDetail.getUser().getEmail())));
    }

    // 결과 페이지 대시보드 카드 조회
    @PostMapping("/result/{sessionId}")
    public ResponseEntity<ApiResponse<ResultResponse>> getResult(@PathVariable Long sessionId,
                                                                 @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(feedbackService.getResult(sessionId, userDetail.getUser().getEmail())));
    }

    // 문항별 심층 스냅샷 리포트 조회
    @PostMapping("/report/{sessionId}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(@PathVariable Long sessionId,
                                                                 @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(feedbackService.getReport(sessionId, userDetail.getUser().getEmail())));
    }

    // 🔥 [추가] 면접 연습 기록 완전 삭제 API
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long sessionId,
                                                    @AuthenticationPrincipal UserDetail userDetail) {
        feedbackService.deleteFeedback(sessionId, userDetail.getUser().getEmail());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }
}