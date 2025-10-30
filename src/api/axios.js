// frontend/SERVICES/apiClient.js

import axios from 'axios';

// 🛑 Replace 'localhost' with the IP of the server running Node.js 
const SERVER_IP = '192.168.100.19'; // Use your confirmed server IP
const PORT = 4000;

const apiClient = axios.create({
  baseURL: `http://${SERVER_IP}:${PORT}/api`, // Corrected URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;