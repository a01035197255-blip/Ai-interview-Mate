package io.github.seong5381.interviewMate.auth.service;

import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@NullMarked
@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음" + email));
        return new UserDetail(user);
    }
}
