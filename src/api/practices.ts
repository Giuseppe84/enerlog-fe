import api from './axiosInstance';
import { PracticesFilter ,PracticesData, Practice} from '@/types/practices';


export const fetchPractices = async (filters: PracticesFilter):Promise<PracticesData> => {
  const response = await api.get('/practices',{
    params: filters,
  });
  return response.data;
};

export const createOrUpdatePractices  = async (practice: Practice) => {
  const response = practice.id
    ? await api.put(`/practices/${practice.id}`, practice)
    : await api.post('/practices', practice);
  return response.data;
};

export const deletePractices  = async (id: string) => {
  const response = await api.delete(`/practices/${id}`);
  return response.data;
};

export const fetchPracticeById = async (id: string) => {
  const response = await api.get(`/practices/${id}`);
  return response.data;
};

