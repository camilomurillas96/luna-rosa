package com.inventory.backend.dto;

import jakarta.validation.constraints.*;

public record MovimientoRequest(
        @NotBlank String tipo,
        @NotNull Integer cantidad,
        String motivo,
        String username
) {}