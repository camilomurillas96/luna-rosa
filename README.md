# GlowInventory - Backend (Maquillaje API)

Sistema de gestión de inventario de maquillaje desarrollado con Java 17 y Spring Boot 3.3.4.

## 🛠 Prerrequisitos

- Java 17
- Maven 3.8+
- Base de datos PostgreSQL (local o Neon Tech)

## 🚀 Instalación y Configuración

1. **Clonar el proyecto y navegar al directorio:**
   ```bash
   git clone <tu-repo>
   cd backend


   Configurar las variables de entorno:
El proyecto requiere las siguientes variables de entorno para funcionar. Puedes configurarlas en tu IDE (IntelliJ/Eclipse) o exportarlas en tu terminal:

Bash
export DB_URL="jdbc:postgresql://<tu-host-neon>.aws.neon.tech/neondb?sslmode=require"
export DB_USERNAME="tu_usuario"
export DB_PASSWORD="tu_password"
export JWT_SECRET="tu_clave_secreta_super_larga_en_base64_aqui_para_seguridad"
Ejecutar la aplicación:

Bash
mvn spring-boot:run
Flyway ejecutará las migraciones automáticamente al arrancar, creando las tablas e insertando el usuario administrador.

🧑‍💻 Credenciales por defecto
Usuario: admin

Contraseña: admin123

📚 Documentación de Endpoints (API REST)
Todas las rutas excepto /api/auth/** requieren autenticación enviando el header:
Authorization: Bearer <tu_token_jwt>

Autenticación
POST /api/auth/login

Body: { "username": "admin", "password": "admin123" }

Respuesta: Devuelve el token JWT y los datos del usuario.

Dashboard
GET /api/dashboard

Devuelve un resumen con el valor total del inventario, total de productos, alertas de stock bajo y productos por caducar.

Productos
GET /api/productos: Lista todos los productos.

GET /api/productos/{id}: Obtiene un producto por su ID.

GET /api/productos/stock-bajo: Lista los productos cuyo stock es menor o igual a su stock mínimo.

POST /api/productos (Solo ADMIN): Crea un nuevo producto.

Body: { "nombre": "Labial Matte", "precioCosto": 5.0, "stock": 10 ... } (Si no envías precioVenta, el sistema lo calcula con el margen configurado).

PUT /api/productos/{id} (Solo ADMIN): Actualiza un producto existente.

POST /api/productos/{id}/movimientos (Solo ADMIN): Registra una entrada, salida o ajuste.

Body: { "tipo": "ENTRADA", "cantidad": 50, "motivo": "Compra a proveedor" }

Movimientos (Historial)
GET /api/movimientos: Lista el historial completo de entradas y salidas.

GET /api/movimientos/producto/{productoId}: Lista los movimientos de un producto específico.

Categorías y Marcas
GET /api/categorias | POST /api/categorias | PUT | DELETE

GET /api/marcas | POST /api/marcas | PUT | DELETE