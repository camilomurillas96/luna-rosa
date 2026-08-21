package com.inventory.backend.controller;

import com.inventory.backend.dto.MovimientoDTO;
import com.inventory.backend.service.MovimientoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {
    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) { this.movimientoService = movimientoService; }

    @GetMapping
    public List<MovimientoDTO> listarTodos() { return movimientoService.listarTodos(); }

    @GetMapping("/producto/{productoId}")
    public List<MovimientoDTO> listarPorProducto(@PathVariable Long productoId) { return movimientoService.listarPorProducto(productoId); }
}