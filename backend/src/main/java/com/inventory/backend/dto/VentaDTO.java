package com.inventory.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VentaDTO(
        Long id,
        LocalDateTime fecha,
        BigDecimal total,
        String clienteNombre,
        String clienteTelefono,
        String metodoPago,
        Boolean activa,
        Long usuarioId,
        String usuarioNombre,
        List<DetalleVentaDTO> detalles
) {}
