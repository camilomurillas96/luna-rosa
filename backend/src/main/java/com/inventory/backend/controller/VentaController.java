package com.inventory.backend.controller;

import com.inventory.backend.dto.VentaDTO;
import com.inventory.backend.service.VentaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    public ResponseEntity<VentaDTO> registrarVenta(@RequestBody VentaDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) 
                ? auth.getName() : null;

        VentaDTO saved = ventaService.registrarVenta(dto, username);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VentaDTO>> obtenerVentas() {
        return ResponseEntity.ok(ventaService.obtenerTodasLasVentas());
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<VentaDTO> anularVenta(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) 
                ? auth.getName() : null;

        VentaDTO anulada = ventaService.anularVenta(id, username);
        return ResponseEntity.ok(anulada);
    }
}
