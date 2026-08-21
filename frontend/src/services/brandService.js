import { apiFetch } from './api';

export const obtenerMarcas = () => apiFetch('/marcas');
export const crearMarca = (marca) => apiFetch('/marcas', { method: 'POST', body: JSON.stringify(marca) });
export const actualizarMarca = (id, marca) => apiFetch(`/marcas/${id}`, { method: 'PUT', body: JSON.stringify(marca) });
export const eliminarMarca = (id) => apiFetch(`/marcas/${id}`, { method: 'DELETE' });
