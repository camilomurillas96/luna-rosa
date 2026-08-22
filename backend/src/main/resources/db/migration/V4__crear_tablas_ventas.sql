CREATE TABLE venta (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    cliente_nombre VARCHAR(255),
    cliente_telefono VARCHAR(50),
    metodo_pago VARCHAR(50) NOT NULL,
    usuario_id BIGINT,
    CONSTRAINT fk_venta_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE detalle_venta (
    id SERIAL PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_venta FOREIGN KEY (venta_id) REFERENCES venta(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id)
);
