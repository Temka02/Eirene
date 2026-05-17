export const API_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://eirene-cywb.onrender.com'
    : 'http://localhost:5000/api';
