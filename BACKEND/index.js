import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración para usar __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar configuración y rutas
import connectDB from './config/db.js'; 
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/salesRoutes.js';
import clientRoutes from './routes/clientsRoutes.js';

// --- Configuración Inicial ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// --- Conexión a la Base de Datos ---
// Llama a tu función de conexión. 
// (Eliminé la segunda llamada a mongoose.connect que tenías más abajo,
// asumiendo que connectDB.js ya maneja esto).
connectDB(); 

// 1. 🚀 MIDDLEWARES (Deben ir primero)
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite recibir y enviar JSON
app.use(express.urlencoded({ extended: true })); // Permite recibir datos de formularios

// 2. 🛣️ RUTAS DE API (Deben ir antes del "atrapa-todo" del frontend)
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);

// Ruta de prueba (opcional, pero útil)
app.get('/api/test', (req, res) => {
  res.send('¡La API de Inven-Venta-Pro está respondiendo!');
});

// 3. 🖥️ RUTAS DE FRONTEND (Deben ir después de la API)
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// El "atrapa-todo" (catch-all) DEBE ser la ÚLTIMA ruta normal.
// Envía el index.html para cualquier ruta que no sea de API ni un archivo estático.
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// 4. ❌ MANEJADORES DE ERRORES (Deben ir al FINAL de todo)

// Middleware 404 (Ruta no encontrada)
app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware de errores (Manejador final de errores internos 500)
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// --- Iniciar el servidor ---
app.listen(PORT, "192.168.100.19", () => {
  console.log(`🚀 Servidor ejecutándose en http://192.168.100.19:${PORT}`);
});
