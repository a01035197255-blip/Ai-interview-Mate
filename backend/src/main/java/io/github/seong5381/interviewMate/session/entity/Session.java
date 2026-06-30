package io.github.seong5381.interviewMate.session.entity;

import io.github.seong5381.interviewMate.answer.entity.Answer;
import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.feedback.entity.Feedback;
import io.github.seong5381.interviewMate.question.entity.Question;
import io.github.seong5381.interviewMate.setting.entity.Setting;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Table(name = "session")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "setting_id")
    private Setting setting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(mappedBy = "session", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Feedback feedback;

    @OneToMany(mappedBy = "session", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Answer> answers;

    @OneToMany(mappedBy = "session", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Question> questions;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @Builder.Default
    private Integer totalQuestions = 10;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Builder.Default
    private Integer timeLimitMinutes = 15;

    private LocalDateTime createdAt;

    private LocalDateTime finishedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = SessionStatus.READY;
        if (this.totalQuestions == null) this.totalQuestions = 10;
        if (this.timeLimitMinutes == null) this.timeLimitMinutes = 15;
    }

    // ==========================================
    // 💡 부모(User, Setting) 및 자식(Feedback) 연결고리 완전 해제 🚀
    // ==========================================
    /**
     * 영속성 컨텍스트 묶임 및 외래키 참조 예외를 방지하기 위해 모든 연관관계를 끊어냅니다.
     */
    public void clearLifecycle() {
        // 1. 👉 [자식 방향] Feedback 및 하위 QnaSnapshot 관계 파기
        if (this.feedback != null) {
            if (this.feedback.getQnaSnapshots() != null) {
                this.feedback.getQnaSnapshots().clear();
            }
            this.feedback.updateSession(null);
            this.feedback = null;
        }

        // 2. 👈 [부모 방향] 외래키(FK) 주인으로서 쥐고 있던 상위 참조 무력화
        // 세션 객체가 더 이상 특정 유저나 세팅 엔티티를 바라보지 않도록 null 매핑 처리합니다.
        this.user = null;
        this.setting = null;
    }

    // ==========================================
    // 💡 핵심 핵심 핵심 비즈니스 도메인 로직 🚀
    // ==========================================

    /**
     * 면접 시작 처리 (상태 변경 및 시작 시간 스탬핑)
     */
    public void start() {
        if (this.status == SessionStatus.READY) {
            this.status = SessionStatus.PROCESSING;
            this.startTime = LocalDateTime.now();
        }
    }

    /**
     * 면접 종료/마감 처리 (상태 변경 및 종료 시간 스탬핑)
     */
    public void finish() {
        this.status = SessionStatus.DONE;
        this.finishedAt = LocalDateTime.now();
        this.endTime = this.finishedAt; // 데이터 싱크 안정화용 보정
    }

    /**
     * 중도 중단/단절 처리
     */
    public void terminate() {
        this.status = SessionStatus.TERMINATED;
        this.finishedAt = LocalDateTime.now();
        this.endTime = this.finishedAt;
    }

    // ==========================================
    // 세부 수동 업데이트가 꼭 필요할 때만 쓰는 세터성 메서드
    // ==========================================
    public void updateStatus(SessionStatus status) {
        this.status = status;
    }

    public void updateStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void updateEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void updateFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }
}