package io.github.seong5381.interviewMate.session.service;

import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.BusinessException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.session.dto.SessionResponse;
import io.github.seong5381.interviewMate.session.entity.Session;
import io.github.seong5381.interviewMate.session.entity.SessionStatus;
import io.github.seong5381.interviewMate.session.repository.UserSessionRepository;
import io.github.seong5381.interviewMate.setting.entity.Setting;
import io.github.seong5381.interviewMate.setting.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final UserSessionRepository userSessionRepository;
    private final SettingRepository settingRepository;
    private final UserRepository userRepository;

    // =========================
    // 1. 세션 생성
    // =========================
    public SessionResponse create(String email, Long settingId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        Setting setting = settingRepository.findById(settingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SETTING_NOT_FOUND));

        Session session = Session.builder()
                .user(user)
                .setting(setting)
                .status(SessionStatus.READY)
                .build();

        return SessionResponse.from(userSessionRepository.save(session));
    }

    // =========================
    // 2. 면접 시작
    // =========================
    public SessionResponse start(Long sessionId, String email) {
        Session session = getSession(sessionId, email);
        validateReady(session);

        session.updateStatus(SessionStatus.PROCESSING);
        session.updateStartTime(LocalDateTime.now());

        return SessionResponse.from(session);
    }

    // =========================
    // 3. 면접 종료
    // =========================
    @Transactional
    public SessionResponse finish(Long sessionId, String email) {
        Session session = getSession(sessionId, email);

        session.updateStatus(SessionStatus.DONE);
        session.updateEndTime(LocalDateTime.now());
        session.updateFinishedAt(LocalDateTime.now());

        userSessionRepository.save(session);

        return SessionResponse.from(session);
    }

    // =========================
    // 4. 세션 단건 조회
    // =========================
    @Transactional(readOnly = true)
    public Session getSessionInternal(Long sessionId, String email) {
        return getSession(sessionId, email);
    }

    // =========================
    // 5. 남은 시간 계산
    // =========================
    public long getRemainingSeconds(Session session) {

        if (session.getStartTime() == null) {
            return session.getTimeLimitMinutes() * 60L;
        }

        long elapsed = Duration.between(
                session.getStartTime(),
                LocalDateTime.now()
        ).getSeconds();

        long limit = session.getTimeLimitMinutes() * 60L;

        return Math.max(limit - elapsed, 0);
    }

    // =========================
    // 6. 시간 종료 여부
    // =========================
    public boolean isTimeOver(Session session) {
        return getRemainingSeconds(session) <= 0;
    }

    // =========================
    // 7. 시간 체크 후 종료 처리
    // =========================
    public void checkTimeAndFinish(Session session) {

        if (isTimeOver(session)) {
            session.updateStatus(SessionStatus.DONE);
            session.updateEndTime(LocalDateTime.now());
        }
    }

    // =========================
    // 내부 유틸
    // =========================
    private Session getSession(Long sessionId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        return userSessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
    }

    private void validateReady(Session session) {
        if (session.getStatus() != SessionStatus.READY) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_DONE);
        }
    }
}