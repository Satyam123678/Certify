package com.satyam.user_service.service.impl;

import com.satyam.user_service.dto.AuthResponse;
import com.satyam.user_service.dto.LoginRequest;
import com.satyam.user_service.dto.RegisterRequest;
import com.satyam.user_service.dto.Roles;
import com.satyam.user_service.persistence.UserServiceEntity;
import com.satyam.user_service.persistence.UserServiceRepository;
import com.satyam.user_service.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl {

    private final UserServiceRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public String  register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        UserServiceEntity user = new UserServiceEntity();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Roles.User);

        userRepository.save(user);


        return "sucessfully registered";
    }

    public AuthResponse login(LoginRequest request) throws Exception {
        UserServiceEntity user = userRepository.findByEmail(request.getEmail());
        if(user ==null){
            throw new Exception("user not found");
        }


        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password!");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(),
                user.getName(), user.getRole().name());
    }
}
