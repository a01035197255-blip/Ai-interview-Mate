package io.github.seong5381.interviewMate.resume.controller;

import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import io.github.seong5381.interviewMate.resume.dto.ResumeCreateRequest;
import io.github.seong5381.interviewMate.resume.dto.ResumeResponse;
import io.github.seong5381.interviewMate.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    // ======================
    // 📌 CREATE (로그인 사용자 기준)
    // ======================
    @PostMapping
    public ResponseEntity<ApiResponse<ResumeResponse>> create(
            @RequestBody ResumeCreateRequest request,
            @AuthenticationPrincipal UserDetail userDetail
    ) {
        ResumeResponse response =
                resumeService.create(request, userDetail.getUser().getEmail());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    // ======================
    // 📌 READ ALL
    // ======================
    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> findAll(@AuthenticationPrincipal UserDetail userDetail) {

        List<ResumeResponse> response = resumeService.findAll(userDetail.getUser().getEmail());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    // ======================
    // 📌 READ ONE
    // ======================
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> findById(@PathVariable Long id) {

        ResumeResponse response = resumeService.findById(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    // ======================
    // 📌 UPDATE
    // ======================
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> update(
            @PathVariable Long id,
            @RequestBody ResumeCreateRequest request
    ) {

        ResumeResponse response = resumeService.update(id, request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    // ======================
    // 📌 DELETE
    // ======================
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {

        resumeService.delete(id);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null));
    }
}