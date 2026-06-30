package io.github.seong5381.interviewMate.dashboard.service;

import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.dashboard.dto.DashboardResponse;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.session.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DashboardService {

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;

    public DashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        long interviewCount = userSessionRepository.countSessionsByEmail(user.getEmail());

        Double avgScore = userSessionRepository.findAvgScoreByEmail(user.getEmail());

        return DashboardResponse.builder()
                .username(user.getName())
                .interviewCount(interviewCount)
                .avgScore(avgScore != null ? avgScore : 0.0)
                .build();
    }
}

