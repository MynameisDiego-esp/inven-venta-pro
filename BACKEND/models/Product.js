// backend/models/Product.js

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // "Nombre"
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    unique: true
  },
  // "Categoria"
  category: {
    type: String,
    trim: true
  },
  // "Descripcion"
  description: {
    type: String,
    trim: true
  },
  // "Precio adquisicion"
  acquisitionPrice: {
    type: Number,
    required: [true, 'El precio de adquisición es obligatorio']
  },
  // "Precio de venta"
  salePrice: {
    type: Number,
    required: [true, 'El precio de venta es obligatorio']
  },
  // "stock"
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  // "url" (para imagen)
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;