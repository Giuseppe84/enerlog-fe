import axios, { AxiosRequestConfig } from 'axios';
const backendUrl = process.env.NEXT_PUBLIC_API_URL;


const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // per inviare anche i cookie se necessario
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
