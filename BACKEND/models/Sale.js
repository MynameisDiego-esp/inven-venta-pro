// backend/models/Sale.js

import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  // Relación con el cliente que realiza la compra
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  // "Metodo de pago": efectivo, tarjeta, transferencias
  paymentMethod: {
    type: String,
    required: true,
    enum: ['efectivo', 'tarjeta', 'transferencias']
  },
  // Lista de productos vendidos
  products: [
    {
      // ✅ CORRECCIÓN: Usamos 'productoId' para coincidir con el frontend
      productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      // "Cantidad"
      quantity: {
        type: Number,
        required: true
      },
      // Precio unitario al momento de la venta
      unitPrice: {
        type: Number,
        required: true
      }
    }
  ],
  // ✅ CORRECCIÓN: Almacenamos la CANTIDAD MONETARIA del IVA
  ivaAmount: { 
    type: Number,
    required: true
  },
  // "Subtotal"
  subtotal: {
    type: Number,
    required: true
  },
  // "Total"
  total: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;