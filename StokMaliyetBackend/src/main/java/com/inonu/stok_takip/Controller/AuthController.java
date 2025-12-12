package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.dto.Request.*;
import com.inonu.stok_takip.dto.Response.AuthResponse;
import com.inonu.stok_takip.Service.AuthService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Sadece ADMIN çağırabilsin
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // Login herkes için açık (SecurityConfig: /api/auth/login -> permitAll)
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // Sadece ADMIN kullanıcı silebilir
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        return authService.deleteUser(id);
    }

    // Sadece ADMIN tüm kullanıcıları görebilir
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public java.util.List<com.inonu.stok_takip.dto.Response.UserResponse> getAllUsers() {
        return authService.getAllUsers();
    }
}
