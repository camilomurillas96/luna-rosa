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
        return marcaRepository.findAll().stream().map(m -> new MarcaDTO(m.getId(), m.getNombre())).collect(Collectors.toList());
    }

    @Transactional
    public MarcaDTO crear(MarcaDTO dto) {
        Marca m = new Marca();
        m.setNombre(dto.nombre());
        m = marcaRepository.save(m);
        return new MarcaDTO(m.getId(), m.getNombre());
    }

    @Transactional
    public MarcaDTO actualizar(Long id, MarcaDTO dto) {
        Marca m = marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada"));
        m.setNombre(dto.nombre());
        return new MarcaDTO(m.getId(), m.getNombre());
    }

    @Transactional
    public void eliminar(Long id) {
        if (!marcaRepository.existsById(id)) throw new ResourceNotFoundException("Marca no encontrada");
        marcaRepository.deleteById(id);
    }
}