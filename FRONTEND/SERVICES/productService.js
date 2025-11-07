// src/services/productService.js

import apiClient from '../src/api/axios';

/**
 * Obtiene todos los productos del backend con paginación y búsqueda.
 * @param {number} page - Número de página (default: 1)
 * @param {string} search - Término de búsqueda (default: '')
 * @param {number} limit - Cantidad de productos por página (default: 16)
 */
export const getAllProducts = async (page = 1, search = '', limit = 16) => {
  try {
    // Construir los parámetros de consulta
    const params = {
      page,
      limit,
    };

    // Solo agregar search si hay un término de búsqueda
    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    const response = await apiClient.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error;
  }
};

/**
 * Obtiene TODOS los productos sin paginación (para reportes y dashboard).
 * Hace múltiples peticiones si es necesario para obtener todas las páginas.
 */
export const getAllProductsNoPagination = async () => {
  try {
    let allProducts = [];
    let currentPage = 1;
    let totalPages = 1;
    
    // Hacer peticiones hasta obtener todas las páginas
    do {
      const response = await apiClient.get('/products', { 
        params: { 
          page: currentPage,
          limit: 50 // Usar un límite razonable que no cause error 500
        } 
      });
      
      const data = response.data;
      
      // Agregar los productos de esta página
      if (Array.isArray(data.products)) {
        allProducts = [...allProducts, ...data.products];
        totalPages = data.totalPages || 1;
      } else if (Array.isArray(data)) {
        allProducts = [...allProducts, ...data];
        break; // Si devuelve array directo, no hay paginación
      }
      
      currentPage++;
      
    } while (currentPage <= totalPages);
    
    console.log(`✅ Loaded ${allProducts.length} products from ${totalPages} pages`);
    return allProducts;
    
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    throw error;
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