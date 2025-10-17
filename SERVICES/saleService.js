// src/services/saleService.js

import apiClient from '../src/api/axios';

/**
 * Obtiene todas las ventas del backend.
 */
export const getAllSales = async () => {
  try {
    const response = await apiClient.get('/sales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    throw error;
  }
};

/**
 * Crea una nueva venta.
 * @param {object} saleData - Objeto con los datos de la venta.
 * El backend se encargará de actualizar el stock.
 */
export const createSale = async (saleData) => {
  try {
    const response = await apiClient.post('/sales', saleData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la venta:', error);
    throw error;
  }
};

/**
 * Elimina (cancela) una venta por su ID.
 * El backend se encargará de restaurar el stock.
 * @param {string} id - El ID de la venta a eliminar.
 */
export const deleteSale = async (id) => {
  try {
    const response = await apiClient.delete(`/sales/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la venta ${id}:`, error);
    throw error;
  }
};