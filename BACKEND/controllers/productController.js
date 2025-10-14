// server/controllers/productController.js
import Product from '../models/Product.js';

// @desc    Obtener todos los productos
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Crear un producto
// @route   POST /api/products
export const createProduct = async (req, res) => {
  const { name, sku, purchasePrice, salePrice, stock } = req.body;
  try {
    const product = new Product({ name, sku, purchasePrice, salePrice, stock });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Datos inválidos', error });
  }
};

// ... aquí irían las funciones para actualizar (update), eliminar (delete), etc.