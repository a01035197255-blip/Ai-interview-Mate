package io.github.seong5381.interviewMate.feedback.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class HistoryResponse {
    private Long id;            // 💡 프론트 링크 이동을 위한 세션 ID 매핑 권장
    private String title;       // 사용자가 커스텀 저장한 진짜 제목
    private Integer score;      // 종합 점수
    private String duration;    // 총 소요 시간 (포맷팅 완료된 문자열)
    private LocalDateTime createdAt;
}