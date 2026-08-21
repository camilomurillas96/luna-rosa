package com.inventory.backend.service;

import com.inventory.backend.dto.ProductoDTO;
import com.inventory.backend.entity.*;
import com.inventory.backend.exception.ResourceNotFoundException;
import com.inventory.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final ConfiguracionRepository configuracionRepository;
    private final MovimientoRepository movimientoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository,
                           MarcaRepository marcaRepository, ConfiguracionRepository configuracionRepository,
                           MovimientoRepository movimientoRepository, UsuarioRepository usuarioRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.marcaRepository = marcaRepository;
        this.configuracionRepository = configuracionRepository;
        this.movimientoRepository = movimientoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<ProductoDTO> listarTodos() {
        return productoRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ProductoDTO obtenerPorId(Long id) {
        return productoRepository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }

    @Transactional
    public ProductoDTO crearProducto(ProductoDTO dto) {
        Producto p = new Producto();
        mapearDatosBase(dto, p);

        if (dto.precioVenta() == null) {
            String margenStr = configuracionRepository.findById("margen_ganancia")
                    .map(Configuracion::getValor).orElse("30");
            BigDecimal margen = new BigDecimal(margenStr);
            BigDecimal multiplicador = BigDecimal.ONE.add(margen.divide(new BigDecimal("100")));
            p.setPrecioVenta(dto.precioCosto().multiply(multiplicador).setScale(2, RoundingMode.HALF_UP));
        } else {
            p.setPrecioVenta(dto.precioVenta());
        }

        p.setStock(dto.stock() != null ? dto.stock() : 0);
        return mapToDTO(productoRepository.save(p));
    }

    @Transactional
    public ProductoDTO actualizarProducto(Long id, ProductoDTO dto) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        mapearDatosBase(dto, p);
        if (dto.precioVenta() != null) p.setPrecioVenta(dto.precioVenta());
        return mapToDTO(productoRepository.save(p));
    }

    @Transactional
    public void registrarMovimiento(Long productoId, String tipo, int cantidad, String motivo, String username) {
        Producto p = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        Usuario u = usuarioRepository.findByUsername(username).orElse(null);

        if ("ENTRADA".equals(tipo)) {
            p.setStock(p.getStock() + cantidad);
        } else if ("SALIDA".equals(tipo)) {
            if (p.getStock() < cantidad) throw new RuntimeException("Stock insuficiente para salida");
            p.setStock(p.getStock() - cantidad);
        } else if ("AJUSTE".equals(tipo)) {
            p.setStock(cantidad);
        } else {
            throw new IllegalArgumentException("Tipo de movimiento inválido");
        }

        Movimiento m = new Movimiento(null, p, tipo, cantidad, LocalDateTime.now(), motivo, u);
        movimientoRepository.save(m);
        productoRepository.save(p);
    }

    public List<ProductoDTO> obtenerStockBajo() {
        return productoRepository.findProductosConStockBajo().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public BigDecimal calcularValorInventario() {
        return productoRepository.findByActivoTrue().stream()
                .map(p -> p.getPrecioCosto().multiply(new BigDecimal(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void mapearDatosBase(ProductoDTO dto, Producto p) {
        p.setNombre(dto.nombre());
        p.setDescripcion(dto.descripcion());
        p.setCodigoBarras(dto.codigoBarras());
        p.setPrecioCosto(dto.precioCosto());
        p.setStockMinimo(dto.stockMinimo() != null ? dto.stockMinimo() : 0);
        p.setFechaVencimiento(dto.fechaVencimiento());
        p.setLote(dto.lote());
        p.setActivo(dto.activo() != null ? dto.activo() : true);

        if (dto.marcaId() != null) {
            p.setMarca(marcaRepository.findById(dto.marcaId()).orElse(null));
        }
        if (dto.categoriaId() != null) {
            p.setCategoria(categoriaRepository.findById(dto.categoriaId()).orElse(null));
        }
    }

    private ProductoDTO mapToDTO(Producto p) {
        return new ProductoDTO(
                p.getId(), p.getNombre(), p.getDescripcion(), p.getCodigoBarras(),
                p.getMarca() != null ? p.getMarca().getId() : null,
                p.getMarca() != null ? p.getMarca().getNombre() : null,
                p.getCategoria() != null ? p.getCategoria().getId() : null,
                p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                p.getPrecioCosto(), p.getPrecioVenta(), p.getStock(), p.getStockMinimo(),
                p.getFechaVencimiento(), p.getLote(), p.getActivo()
        );
    }
}