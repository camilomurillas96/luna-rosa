package com.inventory.backend.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "configuracion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Configuracion {
    @Id
    private String clave;
    private String valor;
}