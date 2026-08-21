package com.inventory.backend.controller;

import com.inventory.backend.dto.*;
import com.inventory.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) { this.productoService = productoService; }

    @GetMapping
    public List<ProductoDTO> listar() { return productoService.listarTodos(); }

    @GetMapping("/stock-bajo")
    public List<ProductoDTO> stockBajo() { return productoService.obtenerStockBajo(); }

    @GetMapping("/{id}")
    public ProductoDTO obtener(@PathVariable Long id) { return productoService.obtenerPorId(id); }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ProductoDTO crear(@Valid @RequestBody ProductoDTO dto) { return productoService.crearProducto(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ProductoDTO actualizar(@PathVariable Long id, @Valid @RequestBody ProductoDTO dto) { return productoService.actualizarProducto(id, dto); }

    @PostMapping("/{id}/movimientos")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void registrarMovimiento(@PathVariable Long id, @Valid @RequestBody MovimientoRequest req, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        productoService.registrarMovimiento(id, req.tipo(), req.cantidad(), req.motivo(), username);
    }
}