package com.inventory.backend.dto;

import java.math.BigDecimal;

public record DashboardDTO(
        Integer productosVendidos,
        Integer stockActual,
        BigDecimal inversionStock,
        BigDecimal inversionVendidos,
        BigDecimal inversionTotal,
        BigDecimal ingresosVentas,
        BigDecimal ganancias
) {}