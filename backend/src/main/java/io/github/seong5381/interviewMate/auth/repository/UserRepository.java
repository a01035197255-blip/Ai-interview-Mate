package io.github.seong5381.interviewMate.auth.repository;

import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.oauth2.module.OAuth2Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByEmailAndProvider(String email, OAuth2Provider provider);
    Optional<User> findByProviderAndProviderId(OAuth2Provider provider, String providerId);
}
