package com.inonu.stok_takip.dto.Response;

import com.inonu.stok_takip.Enum.Role;

public record UserResponse(
    Long id,
    String username,
    Role role
) {}
