package com.inventory.backend.dto;

import java.time.LocalDateTime;

public record MovimientoDTO(
        Long id,
        Long productoId,
        String productoNombre,
        String tipo,
        Integer cantidad,
        LocalDateTime fecha,
        String motivo,
        String usuarioNombre
) {}
