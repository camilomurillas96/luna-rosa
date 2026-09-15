import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUrl from '../assets/luna-rosa-.jpeg';

export const generarComprobantePDF = async (detalles, cliente, metodoPago, total, descuento = 0, isCotizacion = false, ventaId = null) => {
  if (!detalles || detalles.length === 0) {
    alert('No hay productos para generar el comprobante.');
    return;
  }

  const doc = new jsPDF();

  // Convertir logo a base64
  const logoBase64 = await new Promise((resolve) => {
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve(null);
  });

  // Agregar Logo si se cargó correctamente
  if (logoBase64) {
    doc.addImage(logoBase64, 'JPEG', 14, 10, 30, 30);
  }

  // Título y encabezado
  doc.setFontSize(22);
  doc.setTextColor(255, 105, 180); // Color rosado
  doc.text(isCotizacion ? 'Luna Rosa - Cotización' : 'Luna Rosa - Factura de Venta', 50, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 50, 30);
  doc.text(`Cliente: ${cliente?.nombre || 'Consumidor Final'}`, 50, 36);
  if (cliente?.telefono) {
    doc.text(`Teléfono: ${cliente.telefono}`, 50, 42);
  }
  doc.text(`Método de Pago: ${metodoPago}`, 50, 48);
  if (ventaId) {
    doc.text(`ID de Venta: #${ventaId}`, 50, 54);
  }

  // Tabla de productos
  const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Subtotal"];
  const tableRows = [];
  
  let subtotalSinDescuento = 0;

  detalles.forEach(item => {
    subtotalSinDescuento += item.subtotal;
    const row = [
      item.productoNombre,
      item.cantidad,
      `$${item.precioUnitario?.toLocaleString()}`,
      `$${item.subtotal?.toLocaleString()}`
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: ventaId ? 60 : 55,
    theme: 'grid',
    headStyles: { fillColor: [255, 105, 180] } // Rosado
  });

  let finalY = doc.lastAutoTable.finalY || 55;
  
  if (descuento > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Subtotal: $${subtotalSinDescuento.toLocaleString()}`, 14, finalY + 10);
    
    doc.setFontSize(12);
    doc.setTextColor(255, 105, 180);
    doc.text(`Bono / Descuento: -$${descuento.toLocaleString()}`, 14, finalY + 18);
    
    finalY += 15;
  }

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`TOTAL A PAGAR: $${total?.toLocaleString()}`, 14, finalY + 12);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('¡Gracias por tu preferencia!', 14, finalY + 25);

  const nombreArchivo = isCotizacion ? `Cotizacion_${cliente?.nombre || 'Cliente'}.pdf` : `Factura_${cliente?.nombre || 'Cliente'}.pdf`;
  doc.save(nombreArchivo);
};
