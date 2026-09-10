package com.inventory.backend.service;

import com.inventory.backend.dto.DashboardDTO;
import com.inventory.backend.repository.ProductoRepository;
import com.inventory.backend.repository.VentaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {
    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;

    public DashboardService(ProductoRepository productoRepository, VentaRepository ventaRepository) {
        this.productoRepository = productoRepository;
        this.ventaRepository = ventaRepository;
    }

    public DashboardDTO obtenerResumen() {
        Integer stockActual = productoRepository.sumarStockTotal();
        BigDecimal inversionStock = productoRepository.sumarInversionStock();
        
        Integer productosVendidos = ventaRepository.sumarCantidadProductosVendidos();
        BigDecimal ingresosVentas = ventaRepository.sumarIngresosVentas();
        BigDecimal inversionVendidos = ventaRepository.sumarCostoProductosVendidos();
        
        BigDecimal inversionTotal = inversionStock.add(inversionVendidos);
        BigDecimal ganancias = ingresosVentas.subtract(inversionVendidos);

        return new DashboardDTO(
                productosVendidos,
                stockActual,
                inversionStock,
                inversionVendidos,
                inversionTotal,
                ingresosVentas,
                ganancias
        );
    }
}