package io.github.seong5381.interviewMate.feedback.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;
import lombok.*;

@Embeddable
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 스펙을 위한 가드레일 유지
@AllArgsConstructor // 빌더 패턴 활성화를 위해 유지
public class QnaSnapshot {

    private Integer stepOrder; // 질문 순서

    @Lob
    @Column(columnDefinition = "TEXT")
    private String questionText; // AI가 던진 질문 내용

    @Lob
    @Column(columnDefinition = "TEXT")
    private String answerText; // 지원자가 입력한 답변 ("미응답", "중도 종료", "Pass" 등 스냅샷 백업)

    // 🚀 [보존] 프론트엔드 앰버 카드와 연동되는 출제 의도 및 가이드라인 텍스트 컬럼
    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiRecommendation;

    // 🚀 [추가] 프론트엔드 인디고 카드와 연동되는 1인칭 실전 구어체 모범 답변 예시 컬럼
    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiModelAnswer;
}