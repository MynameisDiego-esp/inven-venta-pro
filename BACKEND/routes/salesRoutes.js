// backend/routes/saleRoutes.js

import express from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  deleteSale
} from '../controllers/saleController.js';

const router = express.Router();

// Define las rutas para la colección de ventas
// GET /api/sales -> Obtiene todas las ventas
// POST /api/sales -> Crea una nueva venta
router.route('/')
  .get(getSales)
  .post(createSale);

// Define las rutas para una venta específica por su ID
// GET /api/sales/:id -> Obtiene una venta
// DELETE /api/sales/:id -> Elimina (cancela) una venta
router.route('/:id')
  .get(getSaleById)
  .delete(deleteSale);

export default router;