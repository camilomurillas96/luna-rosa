package com.inventory.backend.dto;

import java.util.List;

public record AuthResponse(
        String token,
        String usuario,
        String nombre,
        List<String> roles
) {}