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

export const fetchAvatar = async (id: string):Promise<string | null> => {
  try {
    const {data} = await api.get(`/clients/${id}/avatar`);
    console.log('Avatar response:', data);
    //const imageUrl = URL.createObjectURL(response.data);
    console.log('Avatar imageUrl:', data?.avatarUrl);
    return data?.avatarUrl;
  } catch (error) {
    return null;
  }
}

export const createOrUpdateClient = async (client: Client) => {
  client.createdAt = client.createdAt || new Date().toISOString();


  const response = client.id
    ? await api.put(`/clients/${client.id}`, client)
    : await api.post('/clients', client);
  return response.data;
};


//clients/d11fbd33-efdd-40a9-9db6-3a9303e8c476/avatar
export const uploadClientAvatarAndColors = async (id: string, image: Blob, colors: string[]) => {
  const formData = new FormData();
  formData.append('avatar', image);

  const response = await api.post(`/clients/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: { colors: colors.join(',') },
  });
  return response.data;
}



export const deleteClient = async (id: string) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};