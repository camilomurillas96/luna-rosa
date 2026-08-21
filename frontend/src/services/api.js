// Ajusta esta URL al puerto donde corre tu Spring Boot
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const obtenerUsuarios = () => apiFetch('/usuarios');
export const crearUsuario = (usuario) => apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(usuario) });
export const actualizarUsuario = (id, usuario) => apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(usuario) });
export const eliminarUsuario = (id) => apiFetch(`/usuarios/${id}`, { method: 'DELETE' });

export const apiFetch = async (endpoint, options = {}) => {
  // Recuperar el token del almacenamiento local
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Si el token es inválido o expiró, cerramos la sesión
      localStorage.removeItem('token');
      window.location.reload(); 
    }
    throw new Error('Error en la petición al backend');
  }

  // Si la respuesta no tiene contenido (como un DELETE), devolvemos null
  if (response.status === 204) return null;
  
  return response.json();
};