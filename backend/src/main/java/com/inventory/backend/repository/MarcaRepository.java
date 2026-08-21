package com.inventory.backend.repository;

import com.inventory.backend.entity.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {
    java.util.List<Marca> findByActivoTrue();
    java.util.List<Marca> findByActivoFalse();
}
