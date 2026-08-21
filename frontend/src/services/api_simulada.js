const API_URL = 'http://localhost:8080/api'; // Ruta hacia tu backend

export const obtenerProductos = async () => {
  // Simulación temporal. Para conectar real: return fetch(`${API_URL}/productos`).then(res => res.json());
  return [
    { id: 1, nombre: 'Labial Mate Rojo Pasión', stock: 45, precio: 25000 },
    { id: 2, nombre: 'Paleta de Sombras Neutras', stock: 12, precio: 45000 },
    { id: 3, nombre: 'Base de Alta Cobertura', stock: 8, precio: 35000 }
  ];
};

export const obtenerUsuarios = async () => {
  return [
    { id: 101, nombre: 'Ana García', rol: 'Administrador', estado: 'Activo' },
    { id: 102, nombre: 'Carlos López', rol: 'Vendedor', estado: 'Inactivo' },
  ];
};