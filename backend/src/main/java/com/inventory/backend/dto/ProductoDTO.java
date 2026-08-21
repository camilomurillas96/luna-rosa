package com.inventory.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductoDTO(
        Long id,
        @NotBlank String nombre,
        String descripcion,
        String codigoBarras,
        Long marcaId,
        String marcaNombre,
        Long categoriaId,
        String categoriaNombre,
        @NotNull BigDecimal precioCosto,
        BigDecimal precioVenta,
        Integer stock,
        Integer stockMinimo,
        LocalDate fechaVencimiento,
        String lote,
        Boolean activo
) {}
