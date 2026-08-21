CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    enabled BOOLEAN DEFAULT true
);

CREATE TABLE rol (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuario_rol (
    usuario_id BIGINT REFERENCES usuario(id) ON DELETE CASCADE,
    rol_id BIGINT REFERENCES rol(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE categoria (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_padre_id BIGINT REFERENCES categoria(id)
);

CREATE TABLE marca (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE producto (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    codigo_barras VARCHAR(50),
    marca_id BIGINT REFERENCES marca(id),
    categoria_id BIGINT REFERENCES categoria(id),
    precio_costo NUMERIC(10,2) NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    fecha_vencimiento DATE,
    lote VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimiento (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES producto(id),
    tipo VARCHAR(10) CHECK (tipo IN ('ENTRADA','SALIDA','AJUSTE')),
    cantidad INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    usuario_id BIGINT REFERENCES usuario(id)
);

CREATE TABLE configuracion (
    clave VARCHAR(50) PRIMARY KEY,
    valor VARCHAR(100)
);