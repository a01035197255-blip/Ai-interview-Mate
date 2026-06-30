package io.github.seong5381.interviewMate.answer.controller;

import io.github.seong5381.interviewMate.answer.dto.AnswerRequest;
import io.github.seong5381.interviewMate.answer.dto.AnswerResponse;
import io.github.seong5381.interviewMate.answer.service.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerService answerService;

    // =========================
    // 1. 답변 제출
    // =========================
    @PostMapping
    public ResponseEntity<AnswerResponse> submit(
            @RequestBody AnswerRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(answerService.submit(request));
    }

    // =========================
    // 2. 질문 기준 답변 조회
    // =========================
    @GetMapping("/question/{questionId}")
    public ResponseEntity<AnswerResponse> getByQuestion(
            @PathVariable Long questionId
    ) {
        return ResponseEntity.ok(
                answerService.getByQuestion(questionId)
        );
    }

    // =========================
    // 3. 세션 전체 답변 조회
    // =========================
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AnswerResponse>> getBySession(
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(
                answerService.getBySession(sessionId)
        );
    }

    // =========================
    // 4. 답변 개수
    // =========================
    @GetMapping("/session/{sessionId}/count")
    public ResponseEntity<Long> count(
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(
                answerService.countBySession(sessionId)
        );
    }

    // =========================
    // 5. 평균 응답 시간
    // =========================
    @GetMapping("/session/{sessionId}/avg-time")
    public ResponseEntity<Double> avgTime(
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(
                answerService.getAvgResponseTime(sessionId)
        );
    }
}