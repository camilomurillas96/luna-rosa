package com.inventory.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record MarcaDTO(
        Long id,
        @NotBlank String nombre,
        Boolean activo
) {}
