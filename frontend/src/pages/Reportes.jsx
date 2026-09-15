import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { generarComprobantePDF } from '../utils/generarPDF';

export default function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busquedaId, setBusquedaId] = useState('');
  const [mostrarAnuladas, setMostrarAnuladas] = useState(false);

  const parsearFechaVenta = (fecha) => {
    if (!fecha) return new Date();
    if (Array.isArray(fecha)) {
      return new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3] || 0, fecha[4] || 0);
    }
    return new Date(fecha);
  };

  const ventasFiltradas = ventas.filter(venta => {
    // Filtrar por estado de anulación
    if (!mostrarAnuladas && !venta.activa) return false;

    // Filtrar por ID de venta
    if (busquedaId && !venta.id.toString().includes(busquedaId.trim())) return false;

    // Filtrar por fechas
    if (fechaInicio || fechaFin) {
      const fechaVenta = parsearFechaVenta(venta.fecha);
      
      if (fechaInicio) {
        const fInicio = new Date(fechaInicio);
        // Ajustamos la hora para que cubra todo el día desde las 00:00:00 (en hora local, aunque por default type="date" asume medianoche UTC si se parsea así. Pero new Date("YYYY-MM-DD") en JS asume UTC, así que sumarle timezone offset o simplemente usar la fecha local de `fInicio.setUTCHours(0)` puede ser útil, pero para no complicarnos sumamos/restamos en local timezone).
        // En realidad, para evitar lios de zona horaria con input date (que devuelve YYYY-MM-DD):
        const [y, m, d] = fechaInicio.split('-');
        const fInicioLocal = new Date(y, m - 1, d);
        if (fechaVenta < fInicioLocal) return false;
      }
      
      if (fechaFin) {
        const [y, m, d] = fechaFin.split('-');
        const fFinLocal = new Date(y, m - 1, d);
        fFinLocal.setHours(23, 59, 59, 999);
        if (fechaVenta > fFinLocal) return false;
      }
    }
    
    return true;
  });

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      const data = await apiFetch('/ventas');
      setVentas(data);
    } catch (error) {
      console.error('Error al cargar ventas', error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = parsearFechaVenta(fecha);
    return isNaN(date.getTime()) ? 'Fecha Inválida' : date.toLocaleString();
  };

  const calcularTotalVendido = () => {
    return ventasFiltradas.filter(v => v.activa).reduce((sum, v) => sum + v.total, 0);
  };

  const anularVenta = async (id) => {
    if (!window.confirm('¿Estás seguro de anular esta venta? El stock será devuelto al inventario.')) return;
    try {
      await apiFetch(`/ventas/${id}/anular`, { method: 'PUT' });
      alert('Venta anulada con éxito');
      cargarVentas(); // Recargar para ver el cambio de estado
    } catch (error) {
      alert('Error al anular la venta');
    }
  };

  const descargarComprobante = async (venta) => {
    const cliente = {
      nombre: venta.clienteNombre,
      telefono: venta.clienteTelefono
    };
    await generarComprobantePDF(venta.detalles, cliente, venta.metodoPago, venta.total, venta.descuento || 0, false, venta.id);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📊 Reporte de Ventas</h2>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Buscar por ID:</label>
          <input type="text" placeholder="Ej: 123" value={busquedaId} onChange={(e) => setBusquedaId(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Fecha Inicio:</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Fecha Fin:</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <input type="checkbox" id="mostrarAnuladas" checked={mostrarAnuladas} onChange={(e) => setMostrarAnuladas(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ff69b4' }} />
          <label htmlFor="mostrarAnuladas" style={{ cursor: 'pointer', color: '#444', fontWeight: 'bold' }}>Mostrar ventas anuladas</label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', flex: 1, border: '1px solid #ddd', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Ventas Totales</h3>
          <h2 style={{ margin: 0, color: '#ff69b4', fontSize: '30px' }}>{ventasFiltradas.length}</h2>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', flex: 1, border: '1px solid #ddd', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Ingresos Totales</h3>
          <h2 style={{ margin: 0, color: '#55efc4', fontSize: '30px' }}>${calcularTotalVendido().toLocaleString()}</h2>
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Productos Vendidos</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((venta) => (
              <tr key={venta.id} style={{ opacity: venta.activa ? 1 : 0.6 }}>
                <td>#{venta.id} {!venta.activa && <span style={{color: 'red', fontWeight: 'bold'}}>[ANULADA]</span>}</td>
                <td style={{ textDecoration: !venta.activa ? 'line-through' : 'none' }}>{formatearFecha(venta.fecha)}</td>
                <td style={{ textDecoration: !venta.activa ? 'line-through' : 'none' }}>
                  <div>{venta.clienteNombre || 'Consumidor Final'}</div>
                  {venta.clienteTelefono && <div style={{ fontSize: '0.8em', color: '#777' }}>{venta.clienteTelefono}</div>}
                </td>
                <td><span className="badge badge-info">{venta.metodoPago}</span></td>
                <td style={{ textDecoration: !venta.activa ? 'line-through' : 'none' }}>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
                    {venta.detalles.map(det => (
                      <li key={det.id}>{det.cantidad}x {det.productoNombre}</li>
                    ))}
                  </ul>
                </td>
                <td><strong style={{ color: venta.activa ? '#ff6b81' : '#999', textDecoration: !venta.activa ? 'line-through' : 'none' }}>${venta.total.toLocaleString()}</strong></td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button onClick={() => descargarComprobante(venta)} className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8em', backgroundColor: '#55efc4', border: 'none', color: '#fff' }}>
                      📄 PDF
                    </button>
                    {venta.activa && (
                      <button onClick={() => anularVenta(venta.id)} className="btn-danger" style={{ padding: '5px 10px', fontSize: '0.8em' }}>
                        ❌ Anular
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {ventasFiltradas.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>No hay ventas que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
