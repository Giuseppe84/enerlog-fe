import axios from 'axios';
const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // essenziale per cookie cross-site
});

// Non serve Authorization se usi solo cookie
export default api;