// server/routes/productRoutes.js
import express from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';

const router = express.Router();

router.route('/').get(getProducts).post(createProduct);
// router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);

export default router;