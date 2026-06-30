package io.github.seong5381.interviewMate.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> authHandlerException(AuthException e) {
        log.warn("AUTH ERROR: {}", e.getMessage());
        return ResponseEntity.status(e.getErrorCode().getStatus())
                .body(ErrorResponse.of(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler(ProfileException.class)
    public ResponseEntity<ErrorResponse> profileHandlerException(ProfileException e) {
        log.warn("PROFILE ERROR: {}", e.getMessage());
        return ResponseEntity.status(e.getErrorCode().getStatus())
                .body(ErrorResponse.of(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler({BadCredentialsException.class, InternalAuthenticationServiceException.class})
    public ResponseEntity<ErrorResponse> handleAuthenticationException(RuntimeException e) {
        log.warn("LOGIN FAILED: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(ErrorCode.AUTH_FAILED));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException (MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
        log.info("VALIDATION ERROR: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> serverErrorHandler(Exception e) {
        log.error("INTERNAL SERVER ERROR: ", e);
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부오류"));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> aiHandlerException(BusinessException e) {
        log.warn("AI ERROR: {}", e.getMessage());
        return ResponseEntity.status(e.getErrorCode().getStatus())
                .body(ErrorResponse.of(e.getErrorCode(), e.getMessage()));
    }
}
