package io.github.seong5381.interviewMate.auth.oauth2.google;

import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2UserUnlink;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuth2UserUnlink implements OAuth2UserUnlink {

    private static final String URL = "https://oauth2.googleapis.com/revoke";
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Override
    public void unlink(String refreshToken) {
        try {
            // 1단계: 내부 헬퍼 메서드를 호출해서 실시간 엑세스 토큰을 스스로 조달합니다.
            String liveAccessToken = getNewGoogleAccessToken(refreshToken);

            // 2단계: 조달한 엑세스 토큰으로 구글에 철회(Revoke) 요청을 쏩니다.
            String url = "https://oauth2.googleapis.com/revoke";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("token", liveAccessToken);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ [Google] 소셜 연동 해제(권한 철회) 완료");
            }
        } catch (Exception e) {
            log.error("❌ [Google] 소셜 연동 해제 중 에러 발생: {}", e.getMessage());
            throw new RuntimeException("구글 연동 해제 실패", e);
        }
    }

    private String getNewGoogleAccessToken(String refreshToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", googleClientId);
        map.add("client_secret", googleClientSecret);
        map.add("refresh_token", refreshToken);
        map.add("grant_type", "refresh_token");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    "https://oauth2.googleapis.com/token",
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<>() {
                    }
            );
            Map<String, Object> response = responseEntity.getBody();

            if (response != null && response.containsKey("access_token")) {
                return (String) response.get("access_token");
            }
        } catch (Exception e) {
            log.error("❌ 구글 리프레시 토큰 갱신 실패: {}", e.getMessage());
            throw new RuntimeException("구글 토큰 갱신에 실패했습니다.");
        }
        return null;
    }
}
