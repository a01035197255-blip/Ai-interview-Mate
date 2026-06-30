package io.github.seong5381.interviewMate.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultResponse {

    private String title;

    // ===== 점수 / 평가 (프론트 규격 매핑) =====
    private Integer totalScore; // result?.score 바인딩
    private String tier;       // result?.grade 바인딩 (S, A, B, C, D)

    // ===== AI 분석 문자열 배열 =====
    private List<String> strengths;
    private List<String> improvements;

    // ===== 면접 정보 (💡 포맷팅 규격 및 변수명 씽크 완료 🚀) =====
    private String totalTime;      // 💡 Long에서 String으로 변경 ("MM:SS" 또는 "분 초" 주입용)
    private Integer passedCount;   // 💡 passedQuestions에서 passedCount로 변경

    // ===== 세부 다차원 진단 역량 점수 (💡 추가 🎯) =====
    private Integer technicalAccuracy;
    private Integer logic;
    private Integer structure;
    private Integer communication;
    private Integer problemSolving;

    // 프론트엔드 툴바 렌더링 호환 가이드 세터 헬퍼 (필요시 사용)
    public Integer getScore() {
        return this.totalScore;
    }

    public String getGrade() {
        return this.tier;
    }
}