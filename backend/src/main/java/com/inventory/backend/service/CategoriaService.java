package com.inventory.backend.service;

import com.inventory.backend.dto.CategoriaDTO;
import com.inventory.backend.entity.Categoria;
import com.inventory.backend.exception.ResourceNotFoundException;
import com.inventory.backend.repository.CategoriaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaDTO> listarTodas() {
        return categoriaRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public CategoriaDTO obtenerPorId(Long id) {
        return categoriaRepository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
    }

    @Transactional
    public CategoriaDTO crear(CategoriaDTO dto) {
        Categoria cat = new Categoria();
        cat.setNombre(dto.nombre());
        cat.setDescripcion(dto.descripcion());
        if (dto.categoriaPadreId() != null) {
            Categoria padre = categoriaRepository.findById(dto.categoriaPadreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría padre no encontrada"));
            cat.setCategoriaPadre(padre);
        }
        return mapToDTO(categoriaRepository.save(cat));
    }

    @Transactional
    public CategoriaDTO actualizar(Long id, CategoriaDTO dto) {
        Categoria cat = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        cat.setNombre(dto.nombre());
        cat.setDescripcion(dto.descripcion());
        if (dto.categoriaPadreId() != null) {
            Categoria padre = categoriaRepository.findById(dto.categoriaPadreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría padre no encontrada"));
            cat.setCategoriaPadre(padre);
        } else {
            cat.setCategoriaPadre(null);
        }
        return mapToDTO(categoriaRepository.save(cat));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) throw new ResourceNotFoundException("Categoría no encontrada");
        categoriaRepository.deleteById(id);
    }

    private CategoriaDTO mapToDTO(Categoria c) {
        return new CategoriaDTO(c.getId(), c.getNombre(), c.getDescripcion(),
                c.getCategoriaPadre() != null ? c.getCategoriaPadre().getId() : null,
                c.getCategoriaPadre() != null ? c.getCategoriaPadre().getNombre() : null);
    }
}