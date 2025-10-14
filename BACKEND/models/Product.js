// server/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true }, // Código del producto
  description: { type: String },
  purchasePrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String },
  // Otros campos que necesites...
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

const Product = mongoose.model('Product', productSchema);
export default Product;