package com.inventory.backend.dto;

import java.math.BigDecimal;

public record DashboardDTO(
        BigDecimal valorInventario,
        long totalProductos,
        long productosStockBajo,
        long productosPorCaducar
) {}