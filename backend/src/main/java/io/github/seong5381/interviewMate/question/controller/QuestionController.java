package io.github.seong5381.interviewMate.question.controller;

import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import io.github.seong5381.interviewMate.question.dto.QuestionGenerateRequest;
import io.github.seong5381.interviewMate.question.dto.QuestionRequestDto;
import io.github.seong5381.interviewMate.question.dto.QuestionResponse;
import io.github.seong5381.interviewMate.question.dto.QuestionResponseDto;
import io.github.seong5381.interviewMate.question.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    // =========================
    // 1. AI 질문 생성 (10문항)
    // =========================
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> generate(@RequestBody QuestionGenerateRequest request,
                                                                        @AuthenticationPrincipal UserDetail userDetail
                                                           ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(questionService.generate(request, userDetail.getUser().getEmail())));
    }

    // =========================
    // 2. 세션 전체 질문 조회
    // =========================
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getBySession(@PathVariable Long sessionId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(questionService.getBySession(sessionId)));

    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<QuestionResponseDto>> askQuestion(
            @AuthenticationPrincipal UserDetail user,
            @RequestBody @Valid QuestionRequestDto requestDto
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(
                        questionService.askQuestion(
                                user.getUser().getEmail(),
                                requestDto
                        )
                ));
    }
}