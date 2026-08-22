import { useState, useEffect } from 'react';
import { obtenerMarcas, crearMarca, actualizarMarca, eliminarMarca } from '../services/brandService';
import { apiFetch } from '../services/api';
import Pagination from '../components/Pagination';

export default function Marcas() {
  const [marcas, setMarcas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '' });
  const [verInactivos, setVerInactivos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN') || roles.includes('Administrador');

  useEffect(() => {
    cargarMarcas();
    setCurrentPage(1);
  }, [verInactivos]);

  const cargarMarcas = async () => {
    try {
      let data = [];
      if (verInactivos) {
        data = await apiFetch('/marcas/inactivos');
      } else {
        data = await obtenerMarcas();
      }
      setMarcas(data);
    } catch (error) {
      console.error('No se pudieron cargar las marcas', error);
    }
  };

  const abrirModal = (marca = null) => {
    if (marca) setFormData(marca);
    else setFormData({ id: null, nombre: '' });
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await actualizarMarca(formData.id, formData);
      } else {
        await crearMarca(formData);
      }
      cargarMarcas();
      cerrarModal();
    } catch (error) {
      alert('Error al guardar la marca');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de enviar esta marca a la papelera?')) {
      try {
        await eliminarMarca(id);
        setMarcas(prev => prev.filter(m => m.id !== id));
        alert('Marca enviada a la papelera');
      } catch (error) {
        alert('Error al eliminar la marca');
      }
    }
  };

  const handleRecuperar = async (id) => {
    try {
      await apiFetch(`/marcas/${id}/recuperar`, { method: 'PUT' });
      setMarcas(prev => prev.filter(m => m.id !== id));
      alert('Marca recuperada con éxito');
    } catch (error) {
      alert('Error al recuperar la marca');
    }
  };
 
  const marcasFiltradas = marcas.filter(m =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMarcas = marcasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-container">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <h2>🏢 Marcas</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Buscar marca..." 
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
          <button className="btn-primary" onClick={() => abrirModal()}>+ Nueva Marca</button>
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: 'auto', width: '100%', marginBottom: '1rem' }}>
        <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentMarcas.map((marca, index) => (
            <tr key={marca.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{marca.nombre}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {!verInactivos ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn-action" onClick={() => abrirModal(marca)}>Editar</button>
                    <button className="btn-danger" onClick={() => handleEliminar(marca.id)}>Eliminar</button>
                  </div>
                ) : (
                  <button className="btn-primary" style={{backgroundColor: '#55efc4'}} onClick={() => handleRecuperar(marca.id)}>Recuperar</button>
                )}
              </td>
            </tr>
          ))}
          {marcasFiltradas.length === 0 && (
            <tr><td colSpan="3" style={{textAlign: 'center'}}>No se encontraron marcas.</td></tr>
          )}
        </tbody>
        </table>
      </div>

      <Pagination 
        itemsPerPage={itemsPerPage} 
        totalItems={marcasFiltradas.length} 
        paginate={paginate} 
        currentPage={currentPage} 
      />

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{formData.id ? 'Editar Marca' : 'Nueva Marca'}</h3>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
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
