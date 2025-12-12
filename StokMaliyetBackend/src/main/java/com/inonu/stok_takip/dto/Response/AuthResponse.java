package com.inonu.stok_takip.dto.Response;

public class AuthResponse {
    private String token;
    private String role;

    // Default constructor
    public AuthResponse() {}

    // Constructor with parameters
    public AuthResponse(String token, String role) {
        this.token = token;
        this.role = role;
    }

    // Getters
    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    // Setters
    public void setToken(String token) {
        this.token = token;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='" + token + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
