import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { obtenerCategorias } from '../services/categoryService';
import { obtenerMarcas } from '../services/brandService';
import Pagination from '../components/Pagination';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categoriasList, setCategoriasList] = useState([]);
  const [marcasList, setMarcasList] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', categoriaId: '', marcaId: '', stock: '', precioCosto: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cargar productos al iniciar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodData, catData, marcData] = await Promise.all([
        apiFetch('/productos'),
        obtenerCategorias(),
        obtenerMarcas()
      ]);
      setProductos(prodData);
      setCategoriasList(catData);
      setMarcasList(marcData);
    } catch (error) {
      console.error('No se pudieron cargar los datos', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const data = await apiFetch('/productos');
      setProductos(data);
    } catch (error) {
      console.error('No se pudieron cargar los productos', error);
    }
  };

  const abrirModal = (producto = null) => {
    if (producto) {
      setFormData({
        ...producto,
        categoriaId: producto.categoriaId || '',
        marcaId: producto.marcaId || ''
      });
    } else {
      setFormData({ id: null, nombre: '', categoriaId: '', marcaId: '', stock: '', precioCosto: '' });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si es categoriaId o marcaId, convertimos a número si no está vacío
    if ((name === 'categoriaId' || name === 'marcaId') && value !== '') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Editar: PUT /api/productos/{id}
        await apiFetch(`/productos/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        // Crear: POST /api/productos
        await apiFetch('/productos', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      cargarProductos(); // Refrescar la tabla
      cerrarModal();
    } catch (error) {
      alert('Error al guardar el producto');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        // Eliminar: DELETE /api/productos/{id}
        await apiFetch(`/productos/${id}`, { method: 'DELETE' });
        cargarProductos(); // Refrescar la tabla
      } catch (error) {
        alert('Error al eliminar el producto');
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductos = productos.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📦 Control de Inventario</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>+ Nuevo Producto</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Producto</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProductos.map(prod => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>{prod.nombre}</td>
              <td><span className="badge badge-info">{prod.categoriaNombre || 'Sin Categoría'}</span></td>
              <td><span className="badge badge-secondary">{prod.marcaNombre || 'Sin Marca'}</span></td>
              <td>
                <span className={`badge ${prod.stock < 15 ? 'badge-warning' : 'badge-success'}`}>
                  {prod.stock} uds
                </span>
              </td>
              <td>${Number(prod.precioCosto).toLocaleString()}</td>
              <td>
                <button className="btn-action" onClick={() => abrirModal(prod)}>Editar</button>
                <button className="btn-danger" onClick={() => handleEliminar(prod.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {productos.length === 0 && (
            <tr><td colSpan="7" style={{textAlign: 'center'}}>No hay productos en el inventario.</td></tr>
          )}
        </tbody>
      </table>
      
      <Pagination 
        itemsPerPage={itemsPerPage} 
        totalItems={productos.length} 
        paginate={paginate} 
        currentPage={currentPage} 
      />

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{formData.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select name="categoriaId" value={formData.categoriaId} onChange={handleChange} required>
                  <option value="">Seleccione una categoría</option>
                  {categoriasList.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Marca</label>
                <select name="marcaId" value={formData.marcaId} onChange={handleChange} required>
                  <option value="">Seleccione una marca</option>
                  {marcasList.map(marca => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stock (Unidades)</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" />
              </div>
              <div className="form-group">
                <label>Precio ($)</label>
                <input type="number" name="precioCosto" value={formData.precioCosto} onChange={handleChange} required min="0" />
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