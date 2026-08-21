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
  const [formData, setFormData] = useState({ id: null, nombre: '', categoriaId: '', marcaId: '', stock: '', precioCosto: '', precioVenta: '' });
  const [verInactivos, setVerInactivos] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN') || roles.includes('Administrador');

  // Cargar productos al iniciar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const endpoint = verInactivos ? '/productos/inactivos' : '/productos';
      const [prodData, catData, marcData] = await Promise.all([
        apiFetch(endpoint),
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
      const endpoint = verInactivos ? '/productos/inactivos' : '/productos';
      const data = await apiFetch(endpoint);
      setProductos(data);
    } catch (error) {
      console.error('No se pudieron cargar los productos', error);
    }
  };

  useEffect(() => {
    cargarProductos();
    setCurrentPage(1);
  }, [verInactivos]);

  const abrirModal = (producto = null) => {
    if (producto) {
      setFormData({
        ...producto,
        categoriaId: producto.categoriaId || '',
        marcaId: producto.marcaId || ''
      });
    } else {
      setFormData({ id: null, nombre: '', categoriaId: '', marcaId: '', stock: '', precioCosto: '', precioVenta: '' });
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
    if (window.confirm('¿Estás seguro de enviar este producto a la papelera?')) {
      try {
        await apiFetch(`/productos/${id}`, { method: 'DELETE' });
        setProductos(prev => prev.filter(p => p.id !== id));
        alert('Producto enviado a la papelera');
      } catch (error) {
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleRecuperar = async (id) => {
    try {
      await apiFetch(`/productos/${id}/recuperar`, { method: 'PUT' });
      setProductos(prev => prev.filter(p => p.id !== id));
      alert('Producto recuperado con éxito');
    } catch (error) {
      alert('Error al recuperar el producto');
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
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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
          <button className="btn-primary" onClick={() => abrirModal()}>+ Nuevo Producto</button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre del Producto</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Stock</th>
            <th>Costo</th>
            <th>Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProductos.map((prod, index) => (
            <tr key={prod.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{prod.nombre}</td>
              <td><span className="badge badge-info">{prod.categoriaNombre || 'Sin Categoría'}</span></td>
              <td><span className="badge badge-secondary">{prod.marcaNombre || 'Sin Marca'}</span></td>
              <td>
                <span className={`badge ${prod.stock < 15 ? 'badge-warning' : 'badge-success'}`}>
                  {prod.stock} uds
                </span>
              </td>
              <td>${Number(prod.precioCosto).toLocaleString()}</td>
              <td>${Number(prod.precioVenta || 0).toLocaleString()}</td>
              <td>
                {!verInactivos ? (
                  <>
                    <button className="btn-action" onClick={() => abrirModal(prod)}>Editar</button>
                    <button className="btn-danger" onClick={() => handleEliminar(prod.id)}>Eliminar</button>
                  </>
                ) : (
                  <button className="btn-primary" style={{backgroundColor: '#55efc4'}} onClick={() => handleRecuperar(prod.id)}>Recuperar</button>
                )}
              </td>
            </tr>
          ))}
          {productos.length === 0 && (
            <tr><td colSpan="8" style={{textAlign: 'center'}}>No hay productos en el inventario.</td></tr>
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
                <label>Precio Costo ($)</label>
                <input type="number" name="precioCosto" value={formData.precioCosto} onChange={handleChange} required min="0" />
              </div>
              <div className="form-group">
                <label>Precio Venta ($)</label>
                <input type="number" name="precioVenta" value={formData.precioVenta} onChange={handleChange} required min="0" />
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