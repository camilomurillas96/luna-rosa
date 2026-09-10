import { useState, useEffect } from 'react';
import { obtenerResumenDashboard } from '../services/api';

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      const data = await obtenerResumenDashboard();
      setResumen(data);
    } catch (err) {
      setError('Error al cargar el resumen. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    if (!valor) return '$0.00';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valor);
  };

  if (loading) return <div className="page-container"><p>Cargando resumen del negocio...</p></div>;
  if (error) return <div className="page-container"><p className="error-msg">{error}</p></div>;
  if (!resumen) return <div className="page-container"><p>No hay datos disponibles.</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📈 Resumen General del Negocio</h2>
        <button className="btn-action" onClick={cargarResumen}>Actualizar Datos</button>
      </div>

      <div style={styles.grid}>
        {/* Productos Vendidos */}
        <div style={{ ...styles.card, borderLeft: '5px solid #a29bfe' }}>
          <h3 style={styles.cardTitle}>Productos Vendidos</h3>
          <p style={styles.cardValue}>{resumen.productosVendidos || 0} unid.</p>
          <span style={styles.cardSubtitle}>Histórico</span>
        </div>

        {/* Stock Actual */}
        <div style={{ ...styles.card, borderLeft: '5px solid #ff9eb5' }}>
          <h3 style={styles.cardTitle}>Stock Actual</h3>
          <p style={styles.cardValue}>{resumen.stockActual || 0} unid.</p>
          <span style={styles.cardSubtitle}>En inventario</span>
        </div>

        {/* Inversión en Stock */}
        <div style={{ ...styles.card, borderLeft: '5px solid #ffeaa7' }}>
          <h3 style={styles.cardTitle}>Inversión en Stock</h3>
          <p style={styles.cardValue}>{formatearMoneda(resumen.inversionStock)}</p>
          <span style={styles.cardSubtitle}>Capital inmovilizado</span>
        </div>

        {/* Ingresos por Ventas */}
        <div style={{ ...styles.card, borderLeft: '5px solid #55efc4' }}>
          <h3 style={styles.cardTitle}>Ingresos por Ventas</h3>
          <p style={styles.cardValue}>{formatearMoneda(resumen.ingresosVentas)}</p>
          <span style={styles.cardSubtitle}>Ventas totales</span>
        </div>

        {/* Inversión Total */}
        <div style={{ ...styles.card, borderLeft: '5px solid #00cec9', gridColumn: '1 / -1' }}>
          <h3 style={styles.cardTitle}>Inversión Total (Stock + Vendidos)</h3>
          <p style={styles.cardValue}>{formatearMoneda(resumen.inversionTotal)}</p>
          <span style={styles.cardSubtitle}>Dinero total invertido en el negocio</span>
        </div>

        {/* Ganancias */}
        <div style={{ ...styles.card, borderLeft: '5px solid #ff7675', gridColumn: '1 / -1', backgroundColor: '#fff0f5' }}>
          <h3 style={styles.cardTitle}>Ganancias Totales (Utilidad)</h3>
          <p style={{ ...styles.cardValue, color: '#ff4757', fontSize: '2.5rem' }}>{formatearMoneda(resumen.ganancias)}</p>
          <span style={styles.cardSubtitle}>Dinero libre producto de las ventas</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  card: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.2s',
  },
  cardTitle: {
    fontSize: '1rem',
    color: '#636e72',
    marginBottom: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  cardValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '5px 0'
  },
  cardSubtitle: {
    fontSize: '0.85rem',
    color: '#b2bec3',
    marginTop: '5px'
  }
};
