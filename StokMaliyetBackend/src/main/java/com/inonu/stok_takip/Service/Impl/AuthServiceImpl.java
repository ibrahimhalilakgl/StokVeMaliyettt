package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.dto.Request.LoginRequest;
import com.inonu.stok_takip.dto.Request.RegisterRequest;
import com.inonu.stok_takip.dto.Response.AuthResponse;
import com.inonu.stok_takip.dto.Response.UserResponse;
import com.inonu.stok_takip.entitiy.User;
import com.inonu.stok_takip.Exception.Login.ApiException;
import com.inonu.stok_takip.Repositoriy.UserRepository;
import com.inonu.stok_takip.Service.AuthService;
import com.inonu.stok_takip.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public String register(RegisterRequest request) {
        if (userRepo.findByUsername(request.username()).isPresent()) {
            throw new ApiException("Bu kullanıcı zaten kayıtlı.");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        userRepo.save(user);
        return "Kayıt başarılı!";
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepo.findByUsername(request.username())
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı!"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ApiException("Şifre hatalı!");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRole(user.getRole().name());
        return response;
    }

    @Override
    public String deleteUser(Long id) {
        if (!userRepo.existsById(id)) {
            throw new ApiException("Kullanıcı bulunamadı!");
        }
        
        userRepo.deleteById(id);
        return "Kullanıcı başarıyla silindi!";
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepo.findAll();
        return users.stream()
                .map(user -> new UserResponse(user.getId(), user.getUsername(), user.getRole()))
                .collect(Collectors.toList());
    }
}
