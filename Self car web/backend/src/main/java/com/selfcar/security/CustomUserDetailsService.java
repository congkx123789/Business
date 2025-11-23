package com.selfcar.security;

import com.selfcar.model.auth.User;
import com.selfcar.repository.auth.UserRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(@NotNull String email) throws UsernameNotFoundException {
        Objects.requireNonNull(email, "Email cannot be null");
        
        if (email.trim().isEmpty()) {
            throw new UsernameNotFoundException("Email cannot be empty");
        }
        
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> {
                    log.debug("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
        
        // Validate user is active
        if (user.getActive() == null || !user.getActive()) {
            log.warn("Attempt to load inactive user: {}", email);
            throw new UsernameNotFoundException("User account is inactive");
        }
        
        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(@NotNull Long id) {
        Objects.requireNonNull(id, "User ID cannot be null");
        
        if (id <= 0) {
            throw new IllegalArgumentException("User ID must be positive");
        }
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.debug("User not found with id: {}", id);
                    return new UsernameNotFoundException("User not found with id: " + id);
                });
        
        // Validate user is active
        if (user.getActive() == null || !user.getActive()) {
            log.warn("Attempt to load inactive user: {}", id);
            throw new UsernameNotFoundException("User account is inactive");
        }
        
        return UserPrincipal.create(user);
    }
}

