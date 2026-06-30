package io.github.seong5381.interviewMate.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// openAPI 전역 설정
import io.swagger.v3.oas.models.security.SecurityRequirement;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // 1. 보안 스키마 정의 (Bearer Token 방식)
        String jwtSchemeName = "jwtAuth";

        // 2. API 문서에서 인증이 필요한 API들에 적용할 규칙 설정
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

        // 3. 실제 보안 헤더 구성 (Authorization: Bearer <token>)
        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name("Authorization")            // 헤더 키 이름
                        .type(SecurityScheme.Type.HTTP)   // HTTP 방식
                        .scheme("bearer")                 // 'Bearer' 인증 방식
                        .bearerFormat("JWT"));            // 상세 포맷은 JWT

        return new OpenAPI()
                .info(new Info()
                        .title("내 프로젝트 API 명세서")
                        .description("인증/회원 관련 API 테스트를 위한 문서입니다.")
                        .version("1.0.0"))
                .addSecurityItem(securityRequirement)     // 전역 보안 설정 적용
                .components(components);
    }
}
