package com.inventory.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String username;
    private String password;
    private String rol;
    private String estado;
}
