// backend/controllers/saleController.js

import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

/**
 * @desc    Crear una nueva venta
 * @route   POST /api/sales
 * @access  Public
 */
export const createSale = async (req, res) => {
  const { client, paymentMethod, products, iva, subtotal, total } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: 'La venta debe incluir al menos un producto.' });
  }

  try {
    // Actualizar el stock de cada producto vendido
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto: ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Crear la nueva venta
    const sale = new Sale({ client, paymentMethod, products, iva, subtotal, total });
    const createdSale = await sale.save();

    res.status(201).json(createdSale);
  } catch (error) {
    // NOTA: Para producción, se debería implementar una transacción de base de datos
    // para asegurar que si algo falla, los cambios de stock se reviertan.
    res.status(400).json({ message: 'No se pudo registrar la venta', error: error.message });
  }
};

/**
 * @desc    Obtener todas las ventas
 * @route   GET /api/sales
 * @access  Public
 */
export const getSales = async (req, res) => {
  try {
    // Usamos populate para traer datos de los modelos referenciados
    const sales = await Sale.find({})
      .populate('client', 'name rfc') // Del cliente, solo trae nombre y rfc
      .populate('products.productId', 'name'); // Del producto, solo trae el nombre
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc    Obtener una venta por su ID
 * @route   GET /api/sales/:id
 * @access  Public
 */
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('products.productId', 'name category');

    if (sale) {
      res.status(200).json(sale);
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc    Eliminar (o cancelar) una venta
 * @route   DELETE /api/sales/:id
 * @access  Public
 */
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (sale) {
      // Devolver el stock de los productos de la venta cancelada
      for (const item of sale.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
      // Eliminar la venta
      await sale.deleteOne();
      res.status(200).json({ message: 'Venta cancelada y stock restaurado.' });
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};