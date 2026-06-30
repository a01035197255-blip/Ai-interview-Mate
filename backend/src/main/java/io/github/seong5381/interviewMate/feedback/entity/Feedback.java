package io.github.seong5381.interviewMate.feedback.entity;

import io.github.seong5381.interviewMate.ai.dto.AiScoreResponse;
import io.github.seong5381.interviewMate.session.entity.Session;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String title;

    // 세션 기준 1:1 평가
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    // ===== AI 평가 점수 =====
    private Integer technicalAccuracy;
    private Integer logic;
    private Integer structure;
    private Integer communication;
    private Integer problemSolving;

    private Integer totalScore;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "feedback_qna_snapshot",
            joinColumns = @JoinColumn(name = "feedback_id")
    )
    private List<QnaSnapshot> qnaSnapshots;

    // ===== AI 결과 =====
    @Lob
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String improvements;

    // 🔥 AI가 판단하는 역량 티어 추가
    private String tier;
    private String tierDescription;

    // ===== 생성 시간 =====
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // ==========================================
    // 💡 핵심 핵심 핵심 비즈니스 도메인 로직 🚀
    // ==========================================

    /**
     * 🚀 [추가] 외래키 참조 관계 해제를 위한 연관관계 편의/수정 메서드
     * 세션이 파기되기 직전, 객체 그래프 상의 묶인 손을 완전히 놓아주기 위해 null 바인딩 통로를 열어줍니다.
     */
    public void updateSession(Session session) {
        this.session = session;
    }

    /**
     * 결과 창 등에서 사용자가 리포트 타이틀 커스텀 변경 시 사용
     */
    public void updateTitle(String title) {
        if (title != null && !title.isBlank()) {
            this.title = title;
        }
    }

    // ==========================================
    // 정적 팩토리 메서드 및 헬퍼 연산
    // ==========================================
    public static Feedback createFeedback(Session session, AiScoreResponse aiResponse, List<QnaSnapshot> qnaSnapshots) {
        Feedback feedbackEntity = Feedback.builder()
                .session(session)
                .title("AI 면접 연습 리포트 #" + session.getId()) // 💡 최초 생성 시 기본 제목 자동 매핑 가드
                .technicalAccuracy(aiResponse.getTechnicalAccuracy())
                .logic(aiResponse.getLogic())
                .structure(aiResponse.getStructure())
                .communication(aiResponse.getCommunication())
                .problemSolving(aiResponse.getProblemSolving())
                .tier(aiResponse.getTier())
                .tierDescription(aiResponse.getTierDescription())
                .feedback(aiResponse.getFeedback())
                .strengths(convertListToString(aiResponse.getStrengths()))
                .improvements(convertListToString(aiResponse.getImprovements()))
                .qnaSnapshots(qnaSnapshots)
                .build();

        feedbackEntity.calculateTotalScore();
        return feedbackEntity;
    }

    public void calculateTotalScore() {
        int sum = (technicalAccuracy != null ? technicalAccuracy : 0)
                + (logic != null ? logic : 0)
                + (structure != null ? structure : 0)
                + (communication != null ? communication : 0)
                + (problemSolving != null ? problemSolving : 0);

        this.totalScore = Math.round((float) sum / 5);
    }

    private static String convertListToString(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        return String.join("||", list);
    }
}