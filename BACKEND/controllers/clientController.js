import Client from '../models/Client.js';

/**
 * @desc    Crear un nuevo cliente
 * @route   POST /api/clients
 * @access  Public
 */
export const createClient = async (req, res) => {
  try {
    const { personType, name, email, phone, rfc, address, isActive } = req.body;
    const client = new Client({
      personType,
      name,
      email,
      phone,
      rfc,
      address,
      isActive
    });
    const createdClient = await client.save();
    res.status(201).json(createdClient);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo crear el cliente', error: error.message });
  }
};

/**
 * @desc    Obtener todos los clientes (CON PAGINACIÓN)
 * @route   GET /api/clients
 * @access  Public
 */
export const getClients = async (req, res) => {
  try {
    const pageSize = 10; // Límite de clientes por página
    // 'page' viene del frontend como un query param (ej. /api/clients?page=2)
    const page = Number(req.query.page) || 1; 

    // Contar el total de documentos de clientes
    const count = await Client.countDocuments(); 

    // Buscar solo los clientes de la página actual
    const clients = await Client.find({})
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // ✅ ESTE ES EL OBJETO QUE TU FRONTEND 'Clientes.tsx' ESPERA
    res.status(200).json({
      clients, // El array de clientes de esta página
      currentPage: page,
      totalPages: Math.ceil(count / pageSize) // El cálculo del total de páginas
    });

  } catch (error) {
    console.error("ERROR en GET /api/clients:", error.message); 
    res.status(500).json({ message: 'Error del servidor al obtener clientes', error: error.message });
  }
};

/**
 * @desc    Obtener un cliente por su ID
 * @route   GET /api/clients/:id
 * @access  Public
 */
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      res.status(200).json(client);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc    Actualizar un cliente
 * @route   PUT /api/clients/:id
 * @access  Public
 */
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      client.personType = req.body.personType || client.personType;
      client.name = req.body.name || client.name;
      client.email = req.body.email || client.email;
      client.phone = req.body.phone || client.phone;
      client.rfc = req.body.rfc || client.rfc;
      client.address = req.body.address || client.address;
      client.isActive = req.body.isActive !== undefined ? req.body.isActive : client.isActive;

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
 * @desc    Eliminar un cliente
 * @route   DELETE /api/clients/:id
 * @access  Public
 */
export const deleteClient = async (req, res) => {
  try {
    // Usamos findByIdAndDelete para encontrar y borrar en un paso
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