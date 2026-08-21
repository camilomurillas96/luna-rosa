package com.inventory.backend.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marca")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Marca {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private Boolean activo = true;
}