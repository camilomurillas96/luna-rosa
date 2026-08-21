import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Inventario from './pages/Inventario';
import Usuarios from './pages/Usuarios';
import Categorias from './pages/Categorias';
import Marcas from './pages/Marcas';
import Login from './pages/Login';
import logo from './assets/luna-rosa-.jpeg';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al cargar la app, verifica si ya hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos el token para cerrar sesión
    localStorage.removeItem('roles'); // Borramos los roles
    localStorage.removeItem('nombre'); // Borramos el nombre
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN') || roles.includes('Administrador');
  const nombreUsuario = localStorage.getItem('nombre') || 'Usuario';

  return (
    <Router>
      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Luna Rosa" className="sidebar-logo" />
            {isAdmin && <h3 className="sidebar-username">¡Hola, {nombreUsuario}!</h3>}
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              📦 Inventario
            </NavLink>
            <NavLink to="/categorias" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              🏷️ Categorias
            </NavLink>
            <NavLink to="/marcas" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              🏢 Marcas
            </NavLink>
            {isAdmin && (
              <NavLink to="/usuarios" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                👥 Usuarios
              </NavLink>
            )}
          </nav>
          <div style={{ marginTop: 'auto', padding: '20px' }}>
            <button className="btn-danger" style={{ width: '100%' }} onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Inventario />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/marcas" element={<Marcas />} />
            {isAdmin && <Route path="/usuarios" element={<Usuarios />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;