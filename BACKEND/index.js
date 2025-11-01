// BACKEND/index.js
import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
// Si estás usando ES modules (import/export), necesitas estas líneas para usar __dirname
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

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// 🧱 Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Cualquier ruta que no coincida con API → devuelve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors()); // Habilita CORS para cualquier origen (perfecto para LAN en desarrollo)
app.use(express.json()); // Permite recibir y enviar JSON
app.use(express.urlencoded({ extended: true })); // Permite recibir datos de formularios  

console.log('MONGODB_URI:', process.env.MONGODB_URI)
// Conexión a MongoDB (Usando el driver Mongoose)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(error => console.error("❌ Error conectando a MongoDB:", error));
   
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Inven-Venta-Pro está corriendo!');
});


// Definir Rutas de API
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);

// --- Manejo de archivos estáticos y rutas no API ---

if (process.env.NODE_ENV === "production") {
    // Servir los archivos estáticos de React
    app.use(express.static(path.join(__dirname, "client/build")));
    
    // Captura cualquier ruta que no sea una de las API, y sirve el index.html de React
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "client/build", "index.html"));
    });
}

// ----------------------------------------------------------------------------------
// MIDDLEWARE DE MANEJO DE ERRORES (DEBE IR AL FINAL DE LAS RUTAS)
// ----------------------------------------------------------------------------------

// Middleware 404 (Ruta no encontrada)
// Se ejecuta SOLO si la solicitud no coincidió con NINGUNA de las rutas anteriores.
// Corrección: Se omite el path ('*') para que Express lo maneje como un catch-all.
app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware de errores (Manejador final de errores internos 500)
// Se reconoce por tener 4 argumentos (error, req, res, next)
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Iniciar el servidor
app.listen(PORT, "192.168.100.19", () => {
  console.log(`🚀 Servidor ejecutándose en http://192.168.100.19:${PORT}`);
});