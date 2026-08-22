import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { generarComprobantePDF } from '../utils/generarPDF';

export default function Reportes() {
  const [ventas, setVentas] = useState([]);
  
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

  const formatearFecha = (fechaArray) => {
    if (!fechaArray) return '';
    // fechaArray is likely [YYYY, MM, DD, HH, mm, ss]
    const date = new Date(fechaArray[0], fechaArray[1] - 1, fechaArray[2], fechaArray[3] || 0, fechaArray[4] || 0);
    return date.toLocaleString();
  };

  const calcularTotalVendido = () => {
    return ventas.filter(v => v.activa).reduce((sum, v) => sum + v.total, 0);
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
    await generarComprobantePDF(venta.detalles, cliente, venta.metodoPago, venta.total, false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📊 Reporte de Ventas</h2>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', flex: 1, border: '1px solid #ddd', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Ventas Totales</h3>
          <h2 style={{ margin: 0, color: '#ff69b4', fontSize: '30px' }}>{ventas.length}</h2>
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
            {ventas.map((venta) => (
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
            {ventas.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>Aún no hay ventas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
