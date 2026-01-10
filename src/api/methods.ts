import api from './axiosInstance';

export interface Method {
  id: string;
  name: string;
}

export const fetchMethods = async (): Promise<Method[]> => {
  // For now, return mock data. In a real application, this would fetch from an API.
  // const response = await api.get('/methods');
  // return response.data;
  return [
    { id: 'method1', name: 'Online' },
    { id: 'method2', name: 'In Person' },
    { id: 'method3', name: 'Phone' },
  ];
};

export const fetchMethodById = async (id: string): Promise<Method | null> => {
  const methods = await fetchMethods();
  return methods.find(method => method.id === id) || null;
};
