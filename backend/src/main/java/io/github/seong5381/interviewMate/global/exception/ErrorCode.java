package io.github.seong5381.interviewMate.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

// 커스텀 에러 코드 열거형
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    TOKEN_EXPIRED (HttpStatus.UNAUTHORIZED, "JWT001","토큰이 만료되었습니다."),
    TOKEN_INVALID (HttpStatus.UNAUTHORIZED, "JWT002","유효하지 않은 토큰입니다."),

    USER_NOT_FOUND (HttpStatus.NOT_FOUND, "USR001","사용자를 찾을 수 없습니다."),
    EMAIL_DUPLICATED (HttpStatus.CONFLICT, "USR002","이미 존재하는 이메일입니다."),
    ACCOUNT_LOCKED (HttpStatus.LOCKED, "USR003","계정이 잠겼습니다."),

    UNAUTHORIZED (HttpStatus.UNAUTHORIZED, "AUTH001","인증이 필요합니다."),
    FORBIDDEN (HttpStatus.FORBIDDEN, "AUTH002","접근 권한이 없습니다."),
    AUTH_FAILED (HttpStatus.UNAUTHORIZED, "AUTH003", "이메일 또는 비밀번호가 일치하지 않습니다"),
    WRONG_PASSWORD (HttpStatus.UNAUTHORIZED, "AUTH004", "비밀번호가 일치하지 않습니다"),
    PASSWORD_MISMATCH (HttpStatus.BAD_REQUEST, "AUTH005", "이전 비밀번호와 일치하지 않습니다"),
    EMAIL_CODE_INVALID (HttpStatus.BAD_REQUEST, "AUTH006", "인증 코드가 일치하지 않습니다"),

    INVALID_PASSWORD (HttpStatus.BAD_REQUEST, "INV001", "올바른 비밀번호 형식이 아닙니다"),
    INVALID_EMAIL (HttpStatus.BAD_REQUEST, "INV002", "올바른 이메일 형식이 아닙니다"),

    PROFILE_NOT_FOUND (HttpStatus.NOT_FOUND,"PRO001", "프로필이 존재하지 않습니다"),
    PROFILE_FORBIDDEN (HttpStatus.FORBIDDEN,"PRO002", "본인 프로필이 아닙니다"),
    PROFILE_IMG_UPLOAD_FAIL (HttpStatus.BAD_REQUEST, "PRO003", "프로필 이미지 업로드 실패"),

    INVALID_INPUT(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "잘못된 요청입니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "NOT_FOUND", "데이터를 찾을 수 없습니다."),
    AI_EVALUATION_PARSE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AI_EVALUATION_PARSE_FAILED", "AI 평가 응답 파싱에 실패했습니다."),
    SETTING_NOT_FOUND(HttpStatus.NOT_FOUND, "SETTING_NOT_FOUND", "설정을 찾을 수 없습니다."),

    // =========================
    // SESSION
    // =========================
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND", "세션이 존재하지 않습니다."),
    SESSION_ALREADY_DONE(HttpStatus.BAD_REQUEST, "SESSION_ALREADY_DONE", "이미 종료된 세션입니다."),

    // =========================
    // QUESTION
    // =========================
    QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND", "질문이 존재하지 않습니다."),

    // =========================
    // ANSWER
    // =========================
    ANSWER_NOT_FOUND(HttpStatus.NOT_FOUND, "ANSWER_NOT_FOUND", "답변이 존재하지 않습니다."),
    FEEDBACK_NOT_FOUND(HttpStatus.NOT_FOUND, "FEEDBACK_NOT_FOUND", "피드백을 찾을 수 없습니다."),
    RESUME_NOT_FOUND(HttpStatus.NOT_FOUND, "RESUME_NOT_FOUND", "이력서를 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
