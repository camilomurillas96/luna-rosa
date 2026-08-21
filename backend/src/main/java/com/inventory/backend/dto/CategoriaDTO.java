package com.inventory.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoriaDTO(
        Long id,
        @NotBlank String nombre,
        String descripcion,
        Long categoriaPadreId,
        String categoriaPadreNombre,
        Boolean activo
) {}
