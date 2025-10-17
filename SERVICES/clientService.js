// src/services/clientService.js

import apiClient from '../src/api/axios'; // ¡Importamos nuestro cliente de Axios!

// Obtener todos los clientes
export const getAllClients = async () => {
  try {
    const response = await apiClient.get('/clients');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    // Lanza el error para que el componente que llama pueda manejarlo
    throw error;
  }
};

// Obtener un cliente por su ID
export const getClientById = async (id) => {
  try {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el cliente ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo cliente
// clientData es un objeto con la info del cliente: { name, email, rfc, ... }
export const createClient = async (clientData) => {
  try {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    throw error;
  }
};

// Actualizar un cliente por su ID
// clientData son los campos a actualizar
export const updateClient = async (id, clientData) => {
  try {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el cliente ${id}:`, error);
    throw error;
  }
};

// Eliminar un cliente por su ID
export const deleteClient = async (id) => {
  try {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el cliente ${id}:`, error);
    throw error;
  }
};