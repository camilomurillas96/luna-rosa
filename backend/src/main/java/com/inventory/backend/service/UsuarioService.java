package com.inventory.backend.service;

import com.inventory.backend.dto.UsuarioDTO;
import com.inventory.backend.entity.Rol;
import com.inventory.backend.entity.Usuario;
import com.inventory.backend.repository.RolRepository;
import com.inventory.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UsuarioDTO crearUsuario(UsuarioDTO dto) {
        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria para un usuario nuevo");
        }

        Usuario u = new Usuario();
        u.setNombre(dto.getNombre());
        u.setUsername(dto.getUsername());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        u.setEnabled("Activo".equalsIgnoreCase(dto.getEstado()));

        if (dto.getRol() != null && !dto.getRol().isEmpty()) {
            String dbRole = "Administrador".equalsIgnoreCase(dto.getRol()) ? "ROLE_ADMIN" : "ROLE_USER";
            Rol rol = rolRepository.findByNombre(dbRole)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            u.setRoles(new java.util.HashSet<>(Collections.singletonList(rol)));
        }

        Usuario guardado = usuarioRepository.save(u);
        return mapToDTO(guardado);
    }

    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO dto) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (dto.getNombre() != null) u.setNombre(dto.getNombre());
        if (dto.getUsername() != null) u.setUsername(dto.getUsername());
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getEstado() != null) {
            u.setEnabled("Activo".equalsIgnoreCase(dto.getEstado()));
        }

        if (dto.getRol() != null && !dto.getRol().isEmpty()) {
            String dbRole = "Administrador".equalsIgnoreCase(dto.getRol()) ? "ROLE_ADMIN" : "ROLE_USER";
            Rol rol = rolRepository.findByNombre(dbRole)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            u.setRoles(new java.util.HashSet<>(Collections.singletonList(rol)));
        }

        Usuario guardado = usuarioRepository.save(u);
        return mapToDTO(guardado);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    private UsuarioDTO mapToDTO(Usuario u) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(u.getId());
        dto.setNombre(u.getNombre());
        dto.setUsername(u.getUsername());
        dto.setEstado(Boolean.TRUE.equals(u.getEnabled()) ? "Activo" : "Inactivo");
        
        if (u.getRoles() != null && !u.getRoles().isEmpty()) {
            String dbRole = u.getRoles().iterator().next().getNombre();
            dto.setRol("ROLE_ADMIN".equals(dbRole) ? "Administrador" : "Vendedor");
        }
        return dto;
    }
}
