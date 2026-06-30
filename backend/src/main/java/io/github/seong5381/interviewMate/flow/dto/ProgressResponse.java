package io.github.seong5381.interviewMate.flow.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProgressResponse {

    private long answeredCount;  // 답변한 개수
    private long totalCount;     // 전체 질문 개수
    private int progress;        // 퍼센트 (0~100)
}