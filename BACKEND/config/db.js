// server/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('>>> MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Salir del proceso con fallo
    process.exit(1);
  }
};

export default connectDB;