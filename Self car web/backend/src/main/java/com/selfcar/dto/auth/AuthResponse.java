package com.selfcar.dto.auth;

import com.selfcar.model.auth.User;
import lombok.Data;

@Data
public class AuthResponse {
    private String token; // Access token
    private String refreshToken; // Refresh token (optional)
    private UserDTO user;

    // Constructor for login/register with refresh token
    public AuthResponse(String token, String refreshToken, UserDTO user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    // Constructor for backward compatibility (without refresh token)
    public AuthResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }

    @Data
    public static class UserDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private User.Role role;

        public UserDTO(User user) {
            this.id = user.getId();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.role = user.getRole();
        }
    }
}

