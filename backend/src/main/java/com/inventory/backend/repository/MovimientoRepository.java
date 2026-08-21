package com.inventory.backend.repository;

import com.inventory.backend.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
    List<Movimiento> findByProductoIdOrderByFechaDesc(Long productoId);
}
