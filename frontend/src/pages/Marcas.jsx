import { useState, useEffect } from 'react';
import { obtenerMarcas, crearMarca, actualizarMarca, eliminarMarca } from '../services/brandService';
import Pagination from '../components/Pagination';

export default function Marcas() {
  const [marcas, setMarcas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    try {
      const data = await obtenerMarcas();
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
    if (window.confirm('¿Estás seguro de eliminar esta marca?')) {
      try {
        await eliminarMarca(id);
        cargarMarcas();
      } catch (error) {
        alert('Error al eliminar la marca');
      }
    }
  };
 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMarcas = marcas.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🏢 Marcas</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>+ Nueva Marca</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentMarcas.map(marca => (
            <tr key={marca.id}>
              <td>{marca.id}</td>
              <td>{marca.nombre}</td>
              <td>
                <button className="btn-action" onClick={() => abrirModal(marca)}>Editar</button>
                <button className="btn-danger" onClick={() => handleEliminar(marca.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {marcas.length === 0 && (
            <tr><td colSpan="3" style={{textAlign: 'center'}}>No hay marcas.</td></tr>
          )}
        </tbody>
      </table>

      <Pagination 
        itemsPerPage={itemsPerPage} 
        totalItems={marcas.length} 
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
