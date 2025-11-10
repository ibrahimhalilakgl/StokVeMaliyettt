package com.inonu.stok_takip.dto.Request;

import com.inonu.stok_takip.Enum.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Kullanıcı adı boş olamaz")
    @Size(min = 3, max = 50, message = "Kullanıcı adı 3-50 karakter arasında olmalıdır")
    String username,
    
    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 5, message = "Şifre en az 5 karakter olmalıdır")
    String password,
    
    @NotNull(message = "Rol seçilmelidir")
    Role role
) {}
