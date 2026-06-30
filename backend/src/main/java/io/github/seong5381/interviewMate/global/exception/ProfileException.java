package io.github.seong5381.interviewMate.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ProfileException extends RuntimeException {
    private final ErrorCode errorCode;
    private final HttpStatus status;

    public ProfileException(ErrorCode errorCode, HttpStatus status) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.status = status;
    }
}
