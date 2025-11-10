package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.LoginRequest;
import com.inonu.stok_takip.dto.Request.RegisterRequest;
import com.inonu.stok_takip.dto.Response.AuthResponse;
import com.inonu.stok_takip.dto.Response.UserResponse;

import java.util.List;

public interface AuthService {
    String register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    String deleteUser(Long id);
    List<UserResponse> getAllUsers();
}
