import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { generarComprobantePDF } from '../utils/generarPDF';

export default function PuntoVenta() {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState({ nombre: '', telefono: '' });
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await apiFetch('/productos');
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos', error);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.marcaNombre && p.marcaNombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.productoId === producto.id);
    if (itemExistente) {
      if (itemExistente.cantidad + 1 > producto.stock) {
        alert('No hay suficiente stock de este producto.');
        return;
      }
      setCarrito(carrito.map(item => 
        item.productoId === producto.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
          : item
      ));
    } else {
      if (producto.stock < 1) {
        alert('Producto sin stock.');
        return;
      }
      setCarrito([...carrito, {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta
      }]);
    }
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const producto = productos.find(p => p.id === productoId);
    if (nuevaCantidad > producto.stock) {
      alert('La cantidad supera el stock disponible.');
      return;
    }
    setCarrito(carrito.map(item => 
      item.productoId === productoId
        ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precioUnitario }
        : item
    ));
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.productoId !== productoId));
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const generarPDF = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    await generarComprobantePDF(carrito, cliente, metodoPago, calcularTotal(), true);
  };

  const confirmarVenta = async () => {
    if (carrito.length === 0) {
      alert('Agrega productos al carrito primero.');
      return;
    }

    const ventaData = {
      total: calcularTotal(),
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      metodoPago: metodoPago,
      detalles: carrito
    };

    try {
      await apiFetch('/ventas', {
        method: 'POST',
        body: JSON.stringify(ventaData)
      });
      alert('Venta registrada con éxito');
      setCarrito([]);
      setCliente({ nombre: '', telefono: '' });
      cargarProductos(); // Refrescar stock
    } catch (error) {
      alert('Error al procesar la venta');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }}>
      
      {/* Columna Izquierda: Productos */}
      <div style={{ flex: '1 1 500px' }}>
        <h2>🛍️ Productos</h2>
        <input 
          type="text" 
          placeholder="Buscar producto por nombre, marca o categoría..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {productosFiltrados.map(prod => (
            <div key={prod.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }} onClick={() => agregarAlCarrito(prod)} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'}>
              <h4 style={{ margin: '0 0 5px 0' }}>{prod.nombre}</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#666' }}>{prod.marcaNombre} - {prod.categoriaNombre}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#ff6b81' }}>${prod.precioVenta?.toLocaleString()}</strong>
                <span style={{ fontSize: '0.8em', backgroundColor: prod.stock > 0 ? '#d4edda' : '#f8d7da', color: prod.stock > 0 ? '#155724' : '#721c24', padding: '2px 6px', borderRadius: '4px' }}>
                  Stock: {prod.stock}
                </span>
              </div>
            </div>
          ))}
          {productosFiltrados.length === 0 && <p>No se encontraron productos.</p>}
        </div>
      </div>

      {/* Columna Derecha: Carrito y Venta */}
      <div style={{ flex: '1 1 400px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #eee', position: 'sticky', top: '20px', height: 'fit-content' }}>
        <h2>🛒 Nueva Venta</h2>
        
        {/* Formulario Cliente */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cliente (Opcional)</label>
          <input type="text" placeholder="Nombre completo" value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="text" placeholder="Teléfono" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Método de Pago</label>
          <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        {/* Lista del carrito */}
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', borderTop: '2px dashed #ccc', paddingTop: '10px' }}>
          {carrito.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>El carrito está vacío</p>
          ) : (
            carrito.map(item => (
              <div key={item.productoId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
                <div style={{ flex: 1 }}>
                  <strong>{item.productoNombre}</strong>
                  <div style={{ fontSize: '0.9em', color: '#555' }}>${item.precioUnitario?.toLocaleString()} c/u</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="number" min="1" value={item.cantidad} onChange={(e) => actualizarCantidad(item.productoId, parseInt(e.target.value) || 1)} style={{ width: '50px', padding: '5px', textAlign: 'center' }} />
                  <strong style={{ width: '80px', textAlign: 'right' }}>${item.subtotal?.toLocaleString()}</strong>
                  <button onClick={() => eliminarDelCarrito(item.productoId)} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', borderTop: '2px dashed #ccc', paddingTop: '15px', marginBottom: '20px' }}>
          <span>Total:</span>
          <span>${calcularTotal().toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={generarPDF} style={{ backgroundColor: '#fff', color: '#ff69b4', border: '2px solid #ff69b4', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            📄 Generar Comprobante PDF
          </button>
          <button onClick={confirmarVenta} style={{ backgroundColor: '#ff69b4', color: '#fff', border: 'none', padding: '15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>
            ✅ Finalizar Venta
          </button>
        </div>
      </div>

    </div>
  );
}
