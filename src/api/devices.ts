import api from './axiosInstance';



export const fetchDevices = async () => {
  const response = await api.post('/auth/trusted/get');
  return response.data;
};