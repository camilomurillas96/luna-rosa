-- src/main/resources/db/migration/V2__insertar_datos_iniciales.sql

INSERT INTO rol (nombre) VALUES ('ROLE_ADMIN'), ('ROLE_USER');

-- Password 'admin123' hasheado con BCrypt
INSERT INTO usuario (username, password, nombre, enabled)
VALUES ('admin', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'Administrador del Sistema', true);

INSERT INTO usuario_rol (usuario_id, rol_id)
VALUES (
    (SELECT id FROM usuario WHERE username = 'admin'),
    (SELECT id FROM rol WHERE nombre = 'ROLE_ADMIN')
);

INSERT INTO configuracion (clave, valor) VALUES ('margen_ganancia', '30');