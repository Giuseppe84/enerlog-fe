import api from './axiosInstance';


export const generate = async (prompt: string):Promise<String> => {
  const response = await api.post(`/ai/generate`,{prompt});
  console.log(response);
  return response.data;
}