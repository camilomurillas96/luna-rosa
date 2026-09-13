import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, IN_STOCK

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await apiFetch('/productos');
      setProductos(data);
    } catch (error) {
      console.error('No se pudieron cargar los productos', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const productosFiltrados = productos.filter(p => {
    if (filter === 'IN_STOCK') return p.stock > 0;
    return true;
  });

  return (
    <div className="catalogo-container" style={{ padding: '20px' }}>
      <div className="catalogo-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2>📕 Catálogo de Productos</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
            <option value="ALL">Todos los productos</option>
            <option value="IN_STOCK">Solo con Stock</option>
          </select>
          <button className="btn-primary" onClick={handlePrint} style={{backgroundColor: '#6c5ce7'}}>🖨️ Exportar a PDF</button>
        </div>
      </div>

      {/* Encabezado exclusivo para el PDF */}
      <div className="print-only-header">
        <h1>Luna Rosa</h1>
        <p>Catálogo Exclusivo de Maquillaje</p>
      </div>

      <div className="catalogo-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {productosFiltrados.map(prod => (
          <div key={prod.id} className="catalogo-card" style={{
            border: '1px solid #eee',
            borderRadius: '10px',
            padding: '15px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {prod.imagenUrl ? (
              <img src={prod.imagenUrl} alt={prod.nombre} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
            ) : (
              <div style={{ width: '100%', height: '250px', backgroundColor: '#f5f6fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', color: '#a4b0be' }}>
                📷 Sin imagen
              </div>
            )}
            <h4 style={{ margin: '10px 0 5px 0', color: '#2d3436' }}>{prod.nombre}</h4>
            {prod.marcaNombre && <span style={{ fontSize: '0.85em', color: '#636e72', marginBottom: '5px' }}>{prod.marcaNombre}</span>}
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#e84393', margin: '10px 0' }}>${Number(prod.precioVenta || 0).toLocaleString()}</p>
            {prod.descripcion && <p style={{ fontSize: '0.9em', color: '#7f8fa6', marginTop: 'auto' }}>{prod.descripcion}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
