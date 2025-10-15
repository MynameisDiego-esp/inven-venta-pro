// backend/models/Client.js

import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  // "Tipo de persona": Fisica, moral
  personType: {
    type: String,
    required: true,
    enum: ['Fisica', 'moral']
  },
  // "Nombre/Razon social"
  name: {
    type: String,
    required: [true, 'El nombre o razón social es obligatorio'],
    trim: true
  },
  // "Email"
  email: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Permite tener múltiples clientes con email null sin violar la unicidad
    lowercase: true
  },
  // "Telefono"
  phone: {
    type: String,
    trim: true
  },
  // "RFC"
  rfc: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Permite tener múltiples clientes con RFC null
  },
  // "Direccion"
  address: {
    type: String,
    trim: true
  },
  // "activo": si/no
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);
export default Client;