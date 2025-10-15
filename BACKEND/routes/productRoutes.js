// backend/routes/productRoutes.js

import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,   // <-- Faltaba esta
  updateProduct,    // <-- Faltaba esta
  deleteProduct     // <-- Faltaba esta
} from '../controllers/productController.js';

const router = express.Router();

// Rutas para /api/products
router.route('/')
  .get(getProducts)
  .post(createProduct);

// Rutas para /api/products/:id
router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;