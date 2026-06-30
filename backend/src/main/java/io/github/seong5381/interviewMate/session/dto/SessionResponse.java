package io.github.seong5381.interviewMate.session.dto;

import io.github.seong5381.interviewMate.session.entity.Session;
import io.github.seong5381.interviewMate.session.entity.SessionStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SessionResponse {

    private Long id;
    private Long userId;
    private SessionStatus status;
    private Integer totalQuestions;

    public static SessionResponse from(Session s) {

        return SessionResponse.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .status(s.getStatus())
                .totalQuestions(s.getTotalQuestions())
                .build();
    }
}