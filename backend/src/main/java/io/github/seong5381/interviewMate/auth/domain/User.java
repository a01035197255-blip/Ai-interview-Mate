package io.github.seong5381.interviewMate.auth.domain;

import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2Provider;
import io.github.seong5381.interviewMate.global.entity.UserBaseTimeEntity;
import io.github.seong5381.interviewMate.session.entity.Session;
import io.github.seong5381.interviewMate.setting.entity.Setting;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.List;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User extends UserBaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 40)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false,  length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OAuth2Provider provider = OAuth2Provider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "profileImg_link", columnDefinition = "TEXT")
    private String profileImgLink;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Setting> settings;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Session> sessions;

    @Builder
    public User(String email, String password, String name, Role role, OAuth2Provider provider, String providerId, String refreshToken, String profileImgLink) {
        this.email = email;
        this.password = password != null ? password : "OAUTH2_AUTHENTICATED_USER";
        this.name = name;
        this.role = role != null ? role : Role.USER;
        this.provider = provider != null ? provider : OAuth2Provider.LOCAL;
        this.providerId = providerId;
        this.refreshToken = refreshToken;

        // ⭐️ [RTR 및 static 완벽 대응] 널이거나 빈값이면 프로젝트 내부 static/img/default.png를 찌르도록 고정!
        this.profileImgLink = (profileImgLink == null || profileImgLink.trim().isEmpty())
                ? "/img/default-profileImg.svg" // (만약 이름을 default-avatar.png로 하셨다면 이렇게)
                : profileImgLink; 
    }

    // 구글에서 사용자가 이름을 바꿨을 때 동기화해 주기 위한 메서드 추가
    public void updateName(String name) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
    }

    public void updateProfileImg(String profileImgLink) {
        if (profileImgLink != null && !profileImgLink.isBlank()) {
            this.profileImgLink = profileImgLink;
        }
    }

    public void changePassword(String newPassword) {
        this.password = newPassword;
    }

    public void updateRefreshToken(String RefreshToken) {
    }
}
