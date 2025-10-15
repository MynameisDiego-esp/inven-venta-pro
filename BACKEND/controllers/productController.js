// backend/controllers/productController.js

import Product from '../models/Product.js';

/**
 * @desc    Crear un nuevo producto
 * @route   POST /api/products
 * @access  Public
 */
export const createProduct = async (req, res) => {
  try {
    const { name, category, description, acquisitionPrice, salePrice, stock, imageUrl } = req.body;
    const product = new Product({
      name,
      category,
      description,
      acquisitionPrice,
      salePrice,
      stock,
      imageUrl
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo crear el producto', error: error.message });
  }
};

/**
 * @desc    Obtener todos los productos
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc    Obtener un producto por su ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc    Actualizar un producto
 * @route   PUT /api/products/:id
 * @access  Public
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.description = req.body.description || product.description;
      product.acquisitionPrice = req.body.acquisitionPrice || product.acquisitionPrice;
      product.salePrice = req.body.salePrice || product.salePrice;
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
      product.imageUrl = req.body.imageUrl || product.imageUrl;

      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

/**
 * @desc    Eliminar un producto
 * @route   DELETE /api/products/:id
 * @access  Public
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.status(200).json({ message: 'Producto eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};