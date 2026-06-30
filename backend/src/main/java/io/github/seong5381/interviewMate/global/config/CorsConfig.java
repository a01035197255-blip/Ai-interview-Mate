package io.github.seong5381.interviewMate.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. 허용할 프론트엔드 도메인 주소 (로컬 테스트용 http, https 둘 다 추가)
        configuration.setAllowedOrigins(List.of(
                "https://interviewmate.n-e.kr",
                "https://interviewmate.n-e.kr"
        ));

        // 2. 허용할 HTTP 메서드 설정
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 3. 허용할 헤더 설정
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));

        // 4. ⭐️ 중요: 프론트에서 쿠키(Refresh Token) 및 인증 헤더를 주고받을 수 있도록 허용
        configuration.setAllowCredentials(true);

        // 5. 브라우저가 preflight(사전 요청) 결과를 캐싱할 시간 설정
        configuration.setMaxAge(3600L);

        // 모든 엔드포인트(/api/** 포함 전체)에 위 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}