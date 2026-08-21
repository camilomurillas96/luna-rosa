import { useState, useEffect } from 'react';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/api';
import Pagination from '../components/Pagination';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', username: '', password: '', confirmarPassword: '', rol: 'Vendedor', estado: 'Activo' });
  const [showPassword, setShowPassword] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios', error);
    }
  };

  const abrirModal = (usuario = null) => {
    if (usuario) {
      // Al editar no traemos el password o lo ponemos vacio
      setFormData({ ...usuario, password: '', confirmarPassword: '' });
    } else {
      setFormData({ id: null, nombre: '', username: '', password: '', confirmarPassword: '', rol: 'Vendedor', estado: 'Activo' });
    }
    setShowPassword(false);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (formData.password || !formData.id) {
      if (formData.password !== formData.confirmarPassword) {
        alert('Las contraseñas no coinciden. Por favor, verifica.');
        return;
      }
    }
    
    try {
      if (formData.id) {
        await actualizarUsuario(formData.id, formData);
      } else {
        await crearUsuario(formData);
      }
      cargarUsuarios();
      cerrarModal();
    } catch (error) {
      alert('Error al guardar el usuario');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await eliminarUsuario(id);
        cargarUsuarios();
      } catch (error) {
        alert('Error al eliminar el usuario');
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsuarios = usuarios.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>👥 Control de Usuarios</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>+ Nuevo Usuario</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUsuarios.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nombre}</td>
              <td>{user.username}</td>
              <td>{user.rol}</td>
              <td>
                <span className={`badge ${user.estado === 'Activo' ? 'badge-success' : 'badge-warning'}`}>
                  {user.estado}
                </span>
              </td>
              <td>
                <button className="btn-action" onClick={() => abrirModal(user)}>Editar</button>
                <button className="btn-danger" onClick={() => handleEliminar(user.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr><td colSpan="6" style={{textAlign: 'center'}}>No hay usuarios.</td></tr>
          )}
        </tbody>
      </table>
      
      <Pagination 
        itemsPerPage={itemsPerPage} 
        totalItems={usuarios.length} 
        paginate={paginate} 
        currentPage={currentPage} 
      />

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{formData.id ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Contraseña {formData.id && <small>(Dejar en blanco para mantener la actual)</small>}</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required={!formData.id} 
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn-secondary"
                    style={{ padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Mostrar/Ocultar contraseña"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmarPassword" 
                  value={formData.confirmarPassword} 
                  onChange={handleChange} 
                  required={(!formData.id) || (formData.password && formData.password.length > 0)} 
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select name="rol" value={formData.rol} onChange={handleChange} required>
                  <option value="Vendedor">Vendedor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} required>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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