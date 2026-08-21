package com.inventory.backend.service;

import com.inventory.backend.dto.DashboardDTO;
import com.inventory.backend.repository.ProductoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DashboardService {
    private final ProductoService productoService;
    private final ProductoRepository productoRepository;

    public DashboardService(ProductoService productoService, ProductoRepository productoRepository) {
        this.productoService = productoService;
        this.productoRepository = productoRepository;
    }

    public DashboardDTO obtenerResumen() {
        BigDecimal valorInventario = productoService.calcularValorInventario();
        long totalProductos = productoRepository.count();
        long stockBajo = productoRepository.findProductosConStockBajo().size();

        LocalDate threshold = LocalDate.now().plusMonths(3);
        long porCaducar = productoRepository.findByFechaVencimientoBefore(threshold).size();

        return new DashboardDTO(valorInventario, totalProductos, stockBajo, porCaducar);
    }
}