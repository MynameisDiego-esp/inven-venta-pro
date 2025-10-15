// BACKEND/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
// Importar rutas
import productRoutes from './routes/productRoutes.js'; // <-- Importaste 'productRoutes'
import saleRoutes from './routes/salesRoutes.js';
import clientRoutes from './routes/clientsRoutes.js';
// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite recibir y enviar JSON

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Inven-Venta-Pro está corriendo!');
});

// Definir Rutas (lo haremos más adelante)
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server corriendo en el puerto ${PORT}`));