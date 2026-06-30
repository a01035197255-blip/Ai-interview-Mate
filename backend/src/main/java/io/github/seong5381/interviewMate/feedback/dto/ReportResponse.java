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
public class ReportResponse {

    private String title;

    // ===== 종합 점수 및 합격률 =====
    private Integer totalScore;
    private Double passRate;

    // ===== AI 등급 및 설명 =====
    private String tier;
    private String tierDescription;

    // ===== 세부 다차원 진단 역량 점수 =====
    private Integer technicalAccuracy;
    private Integer logic;
    private Integer structure;
    private Integer communication;
    private Integer problemSolving;

    // ReportResponse 클래스 내부에 추가
    private List<QnaSnapshotResponse> qnaSnapshots; // 🚀 프론트엔드 백업 데이터 전달용

    // ===== AI 상세 분석 피드백 (💡 필드명 씽크 완비 🎯) =====
    private String summary;             // feedback.getFeedback() 매핑 (프론트 총평)
    private List<String> strengths;    // parse(feedback.getStrengths()) 매핑
    private List<String> improvements; // parse(feedback.getImprovements()) 매핑
}