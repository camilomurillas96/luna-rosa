package com.inventory.backend.controller;

import com.inventory.backend.dto.CategoriaDTO;
import com.inventory.backend.service.CategoriaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) { this.categoriaService = categoriaService; }

    @GetMapping
    public List<CategoriaDTO> listar() { return categoriaService.listarTodas(); }

    @GetMapping("/{id}")
    public CategoriaDTO obtener(@PathVariable Long id) { return categoriaService.obtenerPorId(id); }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    public CategoriaDTO crear(@Valid @RequestBody CategoriaDTO dto) { return categoriaService.crear(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    public CategoriaDTO actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaDTO dto) { return categoriaService.actualizar(id, dto); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    public void eliminar(@PathVariable Long id) { categoriaService.eliminar(id); }
}