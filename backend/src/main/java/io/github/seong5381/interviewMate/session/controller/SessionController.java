package io.github.seong5381.interviewMate.session.controller;

import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import io.github.seong5381.interviewMate.session.dto.SessionCreateRequest;
import io.github.seong5381.interviewMate.session.dto.SessionResponse;
import io.github.seong5381.interviewMate.session.entity.Session;
import io.github.seong5381.interviewMate.session.entity.SessionStatus;
import io.github.seong5381.interviewMate.session.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    // =========================
    // 1. 세션 생성
    // =========================
    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> create(@AuthenticationPrincipal UserDetail userDetail,
                                                  @RequestBody @Valid SessionCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("세션 생성 완료", sessionService.create(userDetail.getUser().getEmail(), request.getSettingId())));
    }

    // =========================
    // 2. 면접 시작
    // =========================
    @PostMapping("/{sessionId}/start")
    public ResponseEntity<SessionResponse> start(@PathVariable Long sessionId,
                                                 @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.ok(sessionService.start(sessionId, userDetail.getUser().getEmail()));
    }

    // =========================
    // 3. 면접 종료
    // =========================
    @PostMapping("/{sessionId}/finish")
    public ResponseEntity<ApiResponse<SessionResponse>> finish(@PathVariable Long sessionId,
                                                  @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("면접 종료", sessionService.finish(sessionId, userDetail.getUser().getEmail())));
    }

    // =========================
    // 4. 세션 조회
    // =========================
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<SessionResponse>> get(@AuthenticationPrincipal UserDetail userDetail,
                                                            @PathVariable Long sessionId ){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(
                SessionResponse.from(sessionService.getSessionInternal(sessionId, userDetail.getUser().getEmail()))));
    }

    // =========================
    // 5. 남은 시간 조회 (프론트용)
    // =========================
    @GetMapping("/{sessionId}/time")
    public ResponseEntity<ApiResponse<Long>> getRemainingTime(@PathVariable Long sessionId,
                                                              @AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(sessionService.getRemainingSeconds(sessionService.getSessionInternal(sessionId, userDetail.getUser().getEmail()))));
    }

    // =========================
    // 6. 강제 시간 체크 (옵션)
    // =========================
    @PostMapping("/{sessionId}/check-time")
    public ResponseEntity<ApiResponse<Boolean>> checkTime(@PathVariable Long sessionId,
                                             @AuthenticationPrincipal UserDetail userDetail) {
        Session session = sessionService.getSessionInternal(sessionId,  userDetail.getUser().getEmail());
        sessionService.checkTimeAndFinish(session);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(session.getStatus() == SessionStatus.DONE));
    }
}