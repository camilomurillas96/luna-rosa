package com.inventory.backend.service;

import com.inventory.backend.dto.DetalleVentaDTO;
import com.inventory.backend.dto.VentaDTO;
import com.inventory.backend.entity.DetalleVenta;
import com.inventory.backend.entity.Producto;
import com.inventory.backend.entity.Usuario;
import com.inventory.backend.entity.Venta;
import com.inventory.backend.exception.ResourceNotFoundException;
import com.inventory.backend.repository.ProductoRepository;
import com.inventory.backend.repository.UsuarioRepository;
import com.inventory.backend.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoService productoService;

    public VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository,
                        UsuarioRepository usuarioRepository, ProductoService productoService) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoService = productoService;
    }

    @Transactional
    public VentaDTO registrarVenta(VentaDTO dto, String username) {
        Venta venta = new Venta();
        venta.setFecha(LocalDateTime.now());
        venta.setTotal(dto.total());
        venta.setClienteNombre(dto.clienteNombre());
        venta.setClienteTelefono(dto.clienteTelefono());
        venta.setMetodoPago(dto.metodoPago());
        
        if (username != null) {
            Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);
            venta.setUsuario(usuario);
        }

        for (DetalleVentaDTO detDTO : dto.detalles()) {
            Producto producto = productoRepository.findById(detDTO.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + detDTO.productoId()));

            // Descontar stock y registrar movimiento
            productoService.registrarMovimiento(producto.getId(), "SALIDA", detDTO.cantidad(), "Venta de productos", username);

            DetalleVenta detalle = new DetalleVenta();
            detalle.setProducto(producto);
            detalle.setCantidad(detDTO.cantidad());
            detalle.setPrecioUnitario(detDTO.precioUnitario());
            detalle.setSubtotal(detDTO.subtotal());

            venta.addDetalle(detalle);
        }

        Venta savedVenta = ventaRepository.save(venta);
        return mapToDTO(savedVenta);
    }

    @Transactional
    public VentaDTO anularVenta(Long id, String username) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + id));

        if (!venta.getActiva()) {
            throw new RuntimeException("La venta ya está anulada");
        }

        venta.setActiva(false);

        for (DetalleVenta detalle : venta.getDetalles()) {
            // Devolver stock
            productoService.registrarMovimiento(
                    detalle.getProducto().getId(), 
                    "ENTRADA", 
                    detalle.getCantidad(), 
                    "Anulación de Venta #" + venta.getId(), 
                    username
            );
        }

        Venta savedVenta = ventaRepository.save(venta);
        return mapToDTO(savedVenta);
    }

    public List<VentaDTO> obtenerTodasLasVentas() {
        // Ordenamos por fecha descendente
        return ventaRepository.findAll().stream()
                .sorted((v1, v2) -> v2.getFecha().compareTo(v1.getFecha()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private VentaDTO mapToDTO(Venta venta) {
        List<DetalleVentaDTO> detallesDTO = venta.getDetalles().stream().map(d -> new DetalleVentaDTO(
                d.getId(),
                d.getProducto().getId(),
                d.getProducto().getNombre(),
                d.getCantidad(),
                d.getPrecioUnitario(),
                d.getSubtotal()
        )).collect(Collectors.toList());

        return new VentaDTO(
                venta.getId(),
                venta.getFecha(),
                venta.getTotal(),
                venta.getClienteNombre(),
                venta.getClienteTelefono(),
                venta.getMetodoPago(),
                venta.getActiva(),
                venta.getUsuario() != null ? venta.getUsuario().getId() : null,
                venta.getUsuario() != null ? venta.getUsuario().getUsername() : null,
                detallesDTO
        );
    }
}
