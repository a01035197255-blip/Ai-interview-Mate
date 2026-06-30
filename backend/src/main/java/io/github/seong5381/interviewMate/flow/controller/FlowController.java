package io.github.seong5381.interviewMate.flow.controller;

import io.github.seong5381.interviewMate.answer.dto.AnswerRequest;
import io.github.seong5381.interviewMate.flow.dto.FlowRequest;
import io.github.seong5381.interviewMate.flow.dto.ProgressResponse;
import io.github.seong5381.interviewMate.flow.service.FlowService;
import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import io.github.seong5381.interviewMate.question.dto.QuestionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/flow")
@RequiredArgsConstructor
public class FlowController {

    private final FlowService flowService;

    // =========================
    // 1. 면접 시작
    // =========================
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<QuestionResponse>> startInterview(@RequestBody FlowRequest request,
                                                                        @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(flowService.startInterview(request.getSessionId(), userDetail.getUser().getEmail())));
    }

    // =========================
    // 2. 다음 질문 (답변 없이 수동 강제 이동)
    // =========================
    @PostMapping("/next")
    public ResponseEntity<ApiResponse<QuestionResponse>> next(@RequestBody FlowRequest request,
                                                              @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(
                        flowService.next(
                                request.getSessionId(),
                                request.getStepOrder(),
                                userDetail.getUser().getEmail()
                        ))
                );
    }

    // =========================
    // 3. 이전 질문
    // =========================
    @PostMapping("/prev")
    public ResponseEntity<ApiResponse<QuestionResponse>> prev(@RequestBody FlowRequest request,
                                                              @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(
                        flowService.prev(
                                request.getSessionId(),
                                request.getStepOrder(),
                                userDetail.getUser().getEmail()
                        ))
                );
    }

    // =========================
    // 4. 패스
    // =========================
    @PostMapping("/pass")
    public ResponseEntity<ApiResponse<QuestionResponse>> pass(@RequestBody FlowRequest request,
                                                              @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(
                        flowService.pass(
                                request.getSessionId(),
                                request.getStepOrder(),
                                userDetail.getUser().getEmail()
                        ))
                );
    }

    // =========================
    // 5. 답변 + 다음 질문 (💡 컴파일 에러 해결 / 보안 가드 연동 🚀)
    // =========================
    @PostMapping("/answer")
    public ResponseEntity<ApiResponse<QuestionResponse>> submitAnswerAndNext(@RequestBody AnswerRequest request,
                                                                             @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(
                        // 🚀 수정: 서비스의 가드 로직 변경 사항에 맞춰 인증 토큰의 email을 함께 파라미터로 명시 전달합니다.
                        flowService.submitAnswerAndNext(request, userDetail.getUser().getEmail())
                ));
    }

    // =========================
    // 6. 질문 전체 조회
    // =========================
    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestions(@RequestBody FlowRequest request,
                                                                            @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(flowService.getQuestions(request.getSessionId())));
    }

    // =========================
    // 7. 진행률
    // =========================
    @PostMapping("/progress")
    public ResponseEntity<ApiResponse<ProgressResponse>> getProgress(@RequestBody FlowRequest request,
                                                                     @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(flowService.getProgress(request.getSessionId(), userDetail.getUser().getEmail())));
    }

    // =========================
    // 8. 종료 체크
    // =========================
    @PostMapping("/finished")
    public ResponseEntity<ApiResponse<Boolean>> isFinished(@RequestBody FlowRequest request,
                                                           @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(flowService.isFinished(request.getSessionId(), userDetail.getUser().getEmail())));
    }

    // =========================
    // 9. 면접 종료
    // =========================
    @PostMapping("/finish")
    public ResponseEntity<Void> finishInterview(@RequestBody FlowRequest request,
                                                @AuthenticationPrincipal UserDetail userDetail) {
        flowService.finishInterview(request.getSessionId(), userDetail.getUser().getEmail());
        return ResponseEntity.ok().build();
    }

    // =========================
    // 10. 중도 종료
    // =========================
    @PostMapping("/terminate")
    public ResponseEntity<Void> terminateInterview(@RequestBody FlowRequest request,
                                                   @AuthenticationPrincipal UserDetail userDetail) {
        flowService.terminateInterview(request.getSessionId(), userDetail.getUser().getEmail());
        return ResponseEntity.ok().build();
    }
}