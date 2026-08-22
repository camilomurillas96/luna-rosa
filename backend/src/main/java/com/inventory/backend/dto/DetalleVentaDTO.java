package com.inventory.backend.dto;

import java.math.BigDecimal;

public record DetalleVentaDTO(
        Long id,
        Long productoId,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {}
