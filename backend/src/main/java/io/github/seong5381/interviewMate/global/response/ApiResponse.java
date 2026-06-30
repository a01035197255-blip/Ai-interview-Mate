package io.github.seong5381.interviewMate.global.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private final boolean success;
    private final int status; // HttpStatus 객체보다 코드를 보내는 게 프론트에서 쓰기 편합니다.
    private final String message;
    private final T data;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, HttpStatus.OK.value(), "요청에 성공하였습니다.", data);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, HttpStatus.OK.value(), message, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, HttpStatus.OK.value(), message, data);
    }

    public static <T> ApiResponse<T> success(T data, String message, HttpStatus status) {
        return new ApiResponse<>(true, status.value(), message, data);
    }

}
