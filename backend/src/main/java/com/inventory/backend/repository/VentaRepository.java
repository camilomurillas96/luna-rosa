package com.inventory.backend.repository;

import com.inventory.backend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE v.activa = true")
    java.math.BigDecimal sumarIngresosVentas();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(d.cantidad), 0) FROM DetalleVenta d JOIN d.venta v WHERE v.activa = true")
    Integer sumarCantidadProductosVendidos();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(d.cantidad * d.producto.precioCosto), 0) FROM DetalleVenta d JOIN d.venta v WHERE v.activa = true")
    java.math.BigDecimal sumarCostoProductosVendidos();
}
