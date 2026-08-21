package com.inventory.backend.service;

import com.inventory.backend.dto.MarcaDTO;
import com.inventory.backend.entity.Marca;
import com.inventory.backend.exception.ResourceNotFoundException;
import com.inventory.backend.repository.MarcaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Service
public class MarcaService {
    private final MarcaRepository marcaRepository;

    public MarcaService(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    public List<MarcaDTO> listarTodas() {
        return marcaRepository.findByActivoTrue().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<MarcaDTO> listarInactivas() {
        return marcaRepository.findByActivoFalse().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private MarcaDTO mapToDTO(Marca m) {
        return new MarcaDTO(m.getId(), m.getNombre(), m.getActivo());
    }

    @Transactional
    public MarcaDTO crear(MarcaDTO dto) {
        Marca m = new Marca();
        m.setNombre(dto.nombre());
        m = marcaRepository.save(m);
        return mapToDTO(m);
    }

    @Transactional
    public MarcaDTO actualizar(Long id, MarcaDTO dto) {
        Marca m = marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada"));
        m.setNombre(dto.nombre());
        return mapToDTO(m);
    }

    @Transactional
    public void eliminar(Long id) {
        Marca m = marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada"));
        m.setActivo(false);
        marcaRepository.save(m);
    }

    @Transactional
    public void recuperar(Long id) {
        Marca m = marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada"));
        m.setActivo(true);
        marcaRepository.save(m);
    }
}