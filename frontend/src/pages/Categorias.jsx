import { useState, useEffect } from 'react';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../services/categoryService';
import { apiFetch } from '../services/api';
import Pagination from '../components/Pagination';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '' });
  const [verInactivos, setVerInactivos] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarCategorias();
    setCurrentPage(1);
  }, [verInactivos]);

  const cargarCategorias = async () => {
    try {
      let data = [];
      if (verInactivos) {
        data = await apiFetch('/categorias/inactivos');
      } else {
        data = await obtenerCategorias();
      }
      setCategorias(data);
    } catch (error) {
      console.error('No se pudieron cargar las categorias', error);
    }
  };

  const abrirModal = (categoria = null) => {
    if (categoria) setFormData(categoria);
    else setFormData({ id: null, nombre: '', descripcion: '' });
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await actualizarCategoria(formData.id, formData);
      } else {
        await crearCategoria(formData);
      }
      cargarCategorias(); // Refrescar la tabla
      cerrarModal();
    } catch (error) {
      alert('Error al guardar la categoria');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de enviar esta categoría a la papelera?')) {
      try {
        await eliminarCategoria(id);
        setCategorias(prev => prev.filter(c => c.id !== id));
        alert('Categoría enviada a la papelera');
      } catch (error) {
        alert('Error al eliminar la categoría');
      }
    }
  };

  const handleRecuperar = async (id) => {
    try {
      await apiFetch(`/categorias/${id}/recuperar`, { method: 'PUT' });
      setCategorias(prev => prev.filter(c => c.id !== id));
      alert('Categoría recuperada con éxito');
    } catch (error) {
      alert('Error al recuperar la categoría');
    }
  };
 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategorias = categorias.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📦 Categorias</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input 
              type="checkbox" 
              checked={verInactivos} 
              onChange={(e) => setVerInactivos(e.target.checked)} 
            />
            Ver Papelera
          </label>
          <button className="btn-primary" onClick={() => abrirModal()}>+ Nueva Categoria</button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentCategorias.map((categoria, index) => (
            <tr key={categoria.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{categoria.nombre}</td>
              <td>{categoria.descripcion}</td>
              <td>
                {!verInactivos ? (
                  <>
                    <button className="btn-action" onClick={() => abrirModal(categoria)}>Editar</button>
                    <button className="btn-danger" onClick={() => handleEliminar(categoria.id)}>Eliminar</button>
                  </>
                ) : (
                  <button className="btn-primary" style={{backgroundColor: '#55efc4'}} onClick={() => handleRecuperar(categoria.id)}>Recuperar</button>
                )}
              </td>
            </tr>
          ))}
          {categorias.length === 0 && (
            <tr><td colSpan="4" style={{textAlign: 'center'}}>No hay categorías.</td></tr>
          )}
        </tbody>
      </table>

      <Pagination 
        itemsPerPage={itemsPerPage} 
        totalItems={categorias.length} 
        paginate={paginate} 
        currentPage={currentPage} 
      />

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input type="text" name="descripcion" value={formData.descripcion || ''} onChange={handleChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}