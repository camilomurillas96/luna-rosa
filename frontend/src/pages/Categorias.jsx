import { useState, useEffect } from 'react';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../services/categoryService';
import { apiFetch } from '../services/api';
import Pagination from '../components/Pagination';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '' });
  const [verInactivos, setVerInactivos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN') || roles.includes('Administrador');

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
 
  const categoriasFiltradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategorias = categoriasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-container">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <h2>📦 Categorias</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Buscar categoría..." 
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '200px' }}
          />
          {isAdmin && (
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="checkbox" 
                checked={verInactivos} 
                onChange={(e) => setVerInactivos(e.target.checked)} 
              />
              Ver Papelera
            </label>
          )}
          <button className="btn-primary" onClick={() => abrirModal()}>+ Nueva Categoria</button>
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: 'auto', width: '100%', marginBottom: '1rem' }}>
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
              <td style={{ whiteSpace: 'nowrap' }}>
                {!verInactivos ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn-action" onClick={() => abrirModal(categoria)}>Editar</button>
                    <button className="btn-danger" onClick={() => handleEliminar(categoria.id)}>Eliminar</button>
                  </div>
                ) : (
                  <button className="btn-primary" style={{backgroundColor: '#55efc4'}} onClick={() => handleRecuperar(categoria.id)}>Recuperar</button>
                )}
              </td>
            </tr>
          ))}
          {categoriasFiltradas.length === 0 && (
            <tr><td colSpan="4" style={{textAlign: 'center'}}>No se encontraron categorías.</td></tr>
          )}
        </tbody>
        </table>
      </div>

      <Pagination 
        itemsPerPage={itemsPerPage} 
        totalItems={categoriasFiltradas.length} 
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