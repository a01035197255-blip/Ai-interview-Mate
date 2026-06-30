package io.github.seong5381.interviewMate.setting.controller;

import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import io.github.seong5381.interviewMate.setting.dto.SettingCreateRequest;
import io.github.seong5381.interviewMate.setting.dto.SettingResponse;
import io.github.seong5381.interviewMate.setting.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settings")
public class SettingController {

    private final SettingService settingService;

    // =========================
    // 생성
    // =========================
    @PostMapping
    public ResponseEntity<ApiResponse<SettingResponse>> create(
            @AuthenticationPrincipal UserDetail userDetail,
            @RequestBody SettingCreateRequest request
    ) {
        SettingResponse response = settingService.create(request, userDetail.getUser().getEmail());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("면접 설정 완료", response));
    }

    // =========================
    // 내 설정 조회
    // =========================
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<SettingResponse>>> getMySettings(@AuthenticationPrincipal UserDetail userDetail) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(settingService.getMySettings(userDetail.getUser().getEmail())));
    }
}