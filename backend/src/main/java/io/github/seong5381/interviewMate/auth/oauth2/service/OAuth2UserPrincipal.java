package io.github.seong5381.interviewMate.auth.oauth2.service;

import io.github.seong5381.interviewMate.auth.domain.User; // 유저 엔티티 임포트
import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2UserInfo;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter // 1. 다른 곳에서 이 내부의 user 객체를 편하게 꺼낼 수 있도록 Getter를 추가합니다.
public class OAuth2UserPrincipal implements OAuth2User, UserDetails {

    private final OAuth2UserInfo userInfo;
    private final User user; // 2. 우리 서비스의 DB 유저 엔티티를 필드로 들고 있게 합니다.

    // UserService에서 넘겨준 가공된 정보와 DB 엔티티를 모두 저장하는 생성자
    public OAuth2UserPrincipal(OAuth2UserInfo userInfo, User user) {
        this.userInfo = userInfo;
        this.user = user;
    }

    @Override
    public String getPassword() {
        // 소셜 유저는 비밀번호 검증을 구글이 대신하므로 null이나 엔티티의 비밀번호를 반환하면 됩니다.
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return userInfo.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = user.getRole().name().startsWith("ROLE_")
                ? user.getRole().name()
                : "ROLE_" + user.getRole().name();

        return List.of(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getName() {
        return user.getName(); // 이메일 대신 실제 사용자의 이름을 반환하도록 수정
    }
}