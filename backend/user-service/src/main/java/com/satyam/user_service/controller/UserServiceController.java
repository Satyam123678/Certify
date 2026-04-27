package com.satyam.user_service.controller;

import com.satyam.user_service.dto.AuthResponse;
import com.satyam.user_service.dto.LoginRequest;
import com.satyam.user_service.dto.RegisterRequest;
import com.satyam.user_service.service.JwtService;
import com.satyam.user_service.service.impl.RefreshTokenService;
import com.satyam.user_service.service.impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class UserServiceController {
    private final UserServiceImpl authService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) throws Exception {
        return ResponseEntity.ok(authService.login(request));
    }

    // Gateway calls this to validate token
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validate(
            @RequestParam String token) {
        return ResponseEntity.ok(jwtService.isTokenValid(token));
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestParam String refreshToken) throws Exception {
       return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestParam String refreshToken) throws Exception{
        refreshTokenService.revokeRefreshToken(refreshToken);
        return ResponseEntity.ok("Logged out successfully!");

    }
}
