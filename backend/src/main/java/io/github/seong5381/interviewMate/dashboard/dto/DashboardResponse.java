package io.github.seong5381.interviewMate.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DashboardResponse {

    private String username;
    private Long interviewCount;        // 누적 면접 횟수
    private Double avgScore;           // 평균 점수 (totalScore 기반)
}