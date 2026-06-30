package io.github.seong5381.interviewMate.setting.util;


import io.github.seong5381.interviewMate.global.security.UserDetail;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    // =========================
    // 현재 로그인 userId
    // =========================
    public static Long getUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                authentication.getPrincipal() == null) {
            throw new RuntimeException("인증 정보 없음");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetail userDetails) {
            return userDetails.getUserId();
        }

        throw new RuntimeException("잘못된 인증 객체");
    }


}