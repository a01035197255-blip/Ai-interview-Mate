package io.github.seong5381.interviewMate.global.exception;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp;
    private HttpStatus status;

    public static ErrorResponse of(ErrorCode errorCode) {
        return ErrorResponse.builder()
                .status(errorCode.getStatus())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return ErrorResponse.builder()
                .status(errorCode.getStatus())
                .code(errorCode.getCode())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(HttpStatus httpStatus, String message) {
        return ErrorResponse.builder()
                .status(httpStatus)
                .code(httpStatus.toString())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
