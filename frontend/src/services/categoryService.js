import { apiFetch } from './api';

export const obtenerCategorias = () => apiFetch('/categorias');
export const crearCategoria = (categoria) => apiFetch('/categorias', { method: 'POST', body: JSON.stringify(categoria) });
export const actualizarCategoria = (id, categoria) => apiFetch(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(categoria) });
export const eliminarCategoria = (id) => apiFetch(`/categorias/${id}`, { method: 'DELETE' });
export const obtenerCategoriasInactivas = () => apiFetch('/categorias/inactivos');
export const recuperarCategoria = (id) => apiFetch(`/categorias/${id}/recuperar`, { method: 'PUT' });