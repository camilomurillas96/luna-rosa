package com.inventory.backend.service;

import com.inventory.backend.dto.MovimientoDTO;
import com.inventory.backend.entity.Movimiento;
import com.inventory.backend.exception.ResourceNotFoundException;
import com.inventory.backend.repository.MovimientoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovimientoService {
    private final MovimientoRepository movimientoRepository;

    public MovimientoService(MovimientoRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    public List<MovimientoDTO> listarPorProducto(Long productoId) {
        return movimientoRepository.findByProductoIdOrderByFechaDesc(productoId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<MovimientoDTO> listarTodos() {
        return movimientoRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private MovimientoDTO mapToDTO(Movimiento m) {
        return new MovimientoDTO(
                m.getId(), m.getProducto().getId(), m.getProducto().getNombre(),
                m.getTipo(), m.getCantidad(), m.getFecha(), m.getMotivo(),
                m.getUsuario() != null ? m.getUsuario().getNombre() : "Sistema"
        );
    }
}