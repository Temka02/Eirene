export const API_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://eirene-server.onrender.com/api'
    : 'http://localhost:5000/api';
