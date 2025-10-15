// backend/controllers/clientController.js

import Client from '../models/Client.js';

/**
 * @desc    Crear un nuevo cliente
 * @route   POST /api/clients
 * @access  Public
 */
export const createClient = async (req, res) => {
  try {
    // Extraemos los datos del cuerpo de la petición
    const { personType, name, email, phone, rfc, address, isActive } = req.body;

    // Creamos una nueva instancia del modelo Client
    const client = new Client({
      personType,
      name,
      email,
      phone,
      rfc,
      address,
      isActive
    });

    // Guardamos el cliente en la base de datos
    const createdClient = await client.save();
    res.status(201).json(createdClient);
  } catch (error) {
    // Si hay un error (ej. email duplicado), enviamos un error 400
    res.status(400).json({ message: 'No se pudo crear el cliente', error: error.message });
  }
};

/**
 * @desc    Obtener todos los clientes
 * @route   GET /api/clients
 * @access  Public
 */
export const getClients = async (req, res) => {
  try {
    // Buscamos todos los documentos en la colección de clientes
    const clients = await Client.find({});
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc    Obtener un cliente por su ID
 * @route   GET /api/clients/:id
 * @access  Public
 */
export const getClientById = async (req, res) => {
  try {
    // Buscamos un cliente por el ID proporcionado en los parámetros de la URL
    const client = await Client.findById(req.params.id);

    if (client) {
      res.status(200).json(client);
    } else {
      // Si no se encuentra el cliente, devolvemos un error 404
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc    Actualizar un cliente
 * @route   PUT /api/clients/:id
 * @access  Public
 */
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (client) {
      // Actualizamos los campos del cliente con los datos del cuerpo de la petición
      client.personType = req.body.personType || client.personType;
      client.name = req.body.name || client.name;
      client.email = req.body.email || client.email;
      client.phone = req.body.phone || client.phone;
      client.rfc = req.body.rfc || client.rfc;
      client.address = req.body.address || client.address;
      client.isActive = req.body.isActive !== undefined ? req.body.isActive : client.isActive;

      // Guardamos los cambios
      const updatedClient = await client.save();
      res.status(200).json(updatedClient);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el cliente', error: error.message });
  }
};

/**
 * @desc    Eliminar un cliente
 * @route   DELETE /api/clients/:id
 * @access  Public
 */
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (client) {
      res.status(200).json({ message: 'Cliente eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};