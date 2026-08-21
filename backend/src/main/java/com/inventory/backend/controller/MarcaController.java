package com.inventory.backend.controller;

import com.inventory.backend.dto.MarcaDTO;
import com.inventory.backend.service.MarcaService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {
    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) { this.marcaService = marcaService; }

    @GetMapping
    public List<MarcaDTO> listar() { return marcaService.listarTodas(); }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public MarcaDTO crear(@Valid @RequestBody MarcaDTO dto) { return marcaService.crear(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public MarcaDTO actualizar(@PathVariable Long id, @Valid @RequestBody MarcaDTO dto) { return marcaService.actualizar(id, dto); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void eliminar(@PathVariable Long id) { marcaService.eliminar(id); }
}