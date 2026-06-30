package io.github.seong5381.interviewMate.global.security;

import io.github.seong5381.interviewMate.auth.domain.User;
import lombok.Getter;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@NullMarked
@Getter
public class UserDetail implements UserDetails, OAuth2User {

    private final User user;
    private final Map<String, Object> attributes;

    // 일반 로그인용 생성자
    public UserDetail(User user) {
        this(user, Collections.emptyMap());
    }

    // 소셜 로그인용 생성자
    public UserDetail(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    public Long getUserId() {
        return user.getId();
    }

    /**
     * 권한 로직: User 엔티티의 Role을 시큐리티 권한으로 변환
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        // 일반 로그인 시 AuthenticationManager가 내부적으로 비교할 때 사용됩니다.
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public String getName() {
        // OAuth2User의 식별자로 email을 사용
        return user.getEmail();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    /* 계정 상태 관리 (기본값 true 세팅) */

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}