import { useState } from 'react';
import logo from '../assets/luna-rosa-.jpeg';

export default function Login({ onLogin }) {
  const [credenciales, setCredenciales] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Petición real a tu endpoint de Spring Boot
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales) // Envia "usuario" y "password" (1234)
      });

      if (response.ok) {
        const data = await response.json();
        // Guardamos el token que nos devuelve el backend
        localStorage.setItem('token', data.token); 
        localStorage.setItem('roles', JSON.stringify(data.roles || []));
        localStorage.setItem('nombre', data.nombre || 'Usuario');
        onLogin(); // Cambia el estado en App.jsx para dar acceso
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Verifica que Spring Boot esté encendido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-container">
          <img src={logo} alt="Luna Rosa" className="login-logo" />
        </div>
        <h2>🔒 Acceso al Sistema</h2>
        {error && <p className="error-msg">{error}</p>}
        
        <div className="form-group">
          <label>Usuario</label>
          <input 
            type="text" 
            name="username" 
            value={credenciales.username} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            name="password" 
            value={credenciales.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}