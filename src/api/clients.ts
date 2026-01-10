import api from './axiosInstance';
import type {Client, ClientsResponse} from '@/types/client';


export const fetchClients = async (
  page = 1,
  limit = 10
): Promise<ClientsResponse> => {
  const res = await api.get('/clients', {
    params: { page, limit },
  });

  return res.data;
};


export const fetchClientById = async (id: string):Promise<Client> => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};



export const createOrUpdateClient = async (client: Client) => {
  client.createdAt = client.createdAt || new Date().toISOString();
  const response = client.id
    ? await api.put(`/clients/${client.id}`, client)
    : await api.post('/clients', client);
  return response.data;
};

export const deleteClient = async (id: string) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};