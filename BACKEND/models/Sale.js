// server/models/Sale.js
import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  totalAmount: { type: Number, required: true },
  client: { type: String, default: 'Cliente General' },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true }
    }
  ],
}, {
  timestamps: true
});

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;