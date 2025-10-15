// backend/routes/clientRoutes.js

import express from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} from '../controllers/clientController.js';

const router = express.Router();

// Define las rutas para la colección de clientes
// GET /api/clients -> Obtiene todos los clientes
// POST /api/clients -> Crea un nuevo cliente
router.route('/')
  .get(getClients)
  .post(createClient);

// Define las rutas para un cliente específico por su ID
// GET /api/clients/:id -> Obtiene un cliente
// PUT /api/clients/:id -> Actualiza un cliente
// DELETE /api/clients/:id -> Elimina un cliente
router.route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

export default router;