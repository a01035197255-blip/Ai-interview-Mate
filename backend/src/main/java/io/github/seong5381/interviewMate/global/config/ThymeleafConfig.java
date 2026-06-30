package io.github.seong5381.interviewMate.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.spring6.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.templatemode.TemplateMode;

@Configuration
public class ThymeleafConfig {

    @Bean
    public SpringResourceTemplateResolver emailTemplateResolver() {
        SpringResourceTemplateResolver resolver = new SpringResourceTemplateResolver();
        // 🚨 최신 부트 환경에서 물리적 jar/클래스패스 경로를 강제 맵핑합니다.
        resolver.setPrefix("classpath:/templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false); // 변경 사항 즉시 반영
        return resolver;
    }

    @Bean
    public SpringTemplateEngine templateEngine() {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        // 위에서 정의한 경로 추적기를 엔진에 직접 이식합니다.
        templateEngine.setTemplateResolver(emailTemplateResolver());
        return templateEngine;
    }
}