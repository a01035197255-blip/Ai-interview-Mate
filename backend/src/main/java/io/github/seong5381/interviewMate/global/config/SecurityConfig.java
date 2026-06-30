package io.github.seong5381.interviewMate.global.config;

import io.github.seong5381.interviewMate.auth.oauth2.handler.OAuth2LoginFailHandler;
import io.github.seong5381.interviewMate.auth.oauth2.handler.OAuth2LoginSuccessHandler;
import io.github.seong5381.interviewMate.auth.repository.HttpCookieOAuth2AuthorizationRequestRepository;
import io.github.seong5381.interviewMate.global.exception.UserAccessDeniedHandler;
import io.github.seong5381.interviewMate.global.exception.CustomAuthenticationEntryPoint;
import io.github.seong5381.interviewMate.global.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j // 로그 출력을 위해 추가
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final UserAccessDeniedHandler accessDeniedHandler;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailHandler oAuth2LoginFailHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final HttpCookieOAuth2AuthorizationRequestRepository  cookieOAuth2AuthorizationRequestRepository;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CustomAuthenticationEntryPoint customAuthenticationEntryPoint) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/login/oauth2/**",
                                "/login/oauth2/code/**",
                                "/login/**",
                                "/api/oauth2/**",
                                "/api/public/**",
                                "/oauth2/authorization/**",
                                "/oauth2.googleapis.com/",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/img/**",
                                "/upload/profile/**",
                                "/api/email/**"
                        ).permitAll()
                        .requestMatchers("/health", "/actuator/health").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/manager/**").hasAnyRole("ADMIN", "MANAGER")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .baseUri("/oauth2/authorization")
                                .authorizationRequestResolver(customAuthorizationRequestResolver())
                                .authorizationRequestRepository(cookieOAuth2AuthorizationRequestRepository)
                        )
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/login/oauth2/code/*")
                        )
                        .successHandler(oAuth2LoginSuccessHandler)

                        // [★ 필수 반영 2] OAuth2 로그인 도중 예외나 실패가 터졌을 때 프론트엔드로 안전하게 리다이렉트 시킵니다.
                        .failureHandler(oAuth2LoginFailHandler)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    private OAuth2AuthorizationRequestResolver customAuthorizationRequestResolver() {
        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");

        resolver.setAuthorizationRequestCustomizer(customizer ->
                customizer.additionalParameters(params -> {
                    // 구글에게 무조건 리프레시 토큰을 달라고 요구하는 핵심 오프라인 스펙 추가
                    params.put("access_type", "offline");
                    params.put("prompt", "select_account consent");
                })
        );

        return resolver;
    }
}