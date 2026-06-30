package io.github.seong5381.interviewMate.dashboard.controller;

import io.github.seong5381.interviewMate.dashboard.dto.DashboardResponse;
import io.github.seong5381.interviewMate.dashboard.service.DashboardService;
import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal UserDetail userDetail) {
        DashboardResponse response = dashboardService.getDashboard(userDetail.getUser().getEmail());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }

}