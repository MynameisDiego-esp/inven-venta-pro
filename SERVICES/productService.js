// src/services/productService.js

import apiClient from '../src/api/axios';

/**
 * Obtiene todos los productos del backend.
 */
export const getAllProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error; // Lanza el error para que el componente lo maneje
  }
};

/**
 * Crea un nuevo producto.
 * @param {object} productData - Objeto con los datos del producto.
 */
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el producto:', error);
    throw error;
  }
};

/**
 * Actualiza un producto existente por su ID.
 * @param {string} id - El ID del producto a actualizar.
 * @param {object} productData - Los campos del producto a actualizar.
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el producto ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un producto por su ID.
 * @param {string} id - El ID del producto a eliminar.
 */
export const deleteProduct = async (id) => {
  try {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el producto ${id}:`, error);
    throw error;
  }
};