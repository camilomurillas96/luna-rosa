package com.inventory.backend.controller;

import com.inventory.backend.dto.*;
import com.inventory.backend.entity.Usuario;
import com.inventory.backend.repository.UsuarioRepository;
import com.inventory.backend.security.JwtUtil;
import com.inventory.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;
        private final UsuarioRepository usuarioRepository;

        public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
                this.authenticationManager = authenticationManager;
                this.jwtUtil = jwtUtil;
                this.usuarioRepository = usuarioRepository;
        }

        @PostMapping("/login")
        public AuthResponse login(@Valid @RequestBody AuthRequest request) {
                Authentication auth = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.username(), request.password())
                );
                org.springframework.security.core.userdetails.User userDetails =
                        (org.springframework.security.core.userdetails.User) auth.getPrincipal();

                String token = jwtUtil.generateToken(userDetails);
                Usuario usuario = usuarioRepository.findByUsername(request.username()).orElseThrow();

                List<String> roles = userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).collect(Collectors.toList());

                return new AuthResponse(token, usuario.getUsername(), usuario.getNombre(), roles);
        }
}