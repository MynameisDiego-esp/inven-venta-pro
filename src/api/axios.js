import axios from 'axios';

// Creamos una instancia de Axios con una configuración base.
const apiClient = axios.create({
  // Esta es la URL base de tu backend.
  // Todas las peticiones se harán a esta dirección.
  baseURL: 'http://localhost:4000/api',
  
  // Opcional: puedes añadir cabeceras que se enviarán en todas las peticiones.
  headers: {
    'Content-Type': 'application/json'
  }
});

// Exportamos la instancia para poder usarla en otros archivos (como tus servicios).
export default apiClient;