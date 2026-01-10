

import api from './axiosInstance';

// Placeholder interfaces for related types
interface Method {
  id: string;
  name: string;
}

interface Work {
  id: string;
  // Add other relevant fields for Work if needed
}

interface ServiceDocument {
  id: string;
  // Add other relevant fields for ServiceDocument if needed
}

export interface Service {
  id: string;
  name: string;
  acronym?: string;
  description?: string;
  image?: string;
  price: number;
  duration: number;
  isArchived: boolean;
  methodId: string;
  method?: Method; // Relation
  color?: string;
  icon?: string;
  works?: Work[]; // Relation
  createdAt: string; // Assuming string for simplicity, can be Date
  updatedAt: string; // Assuming string for simplicity, can be Date
  serviceDocuments?: ServiceDocument[]; // Relation
}

export const fetchServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const fetchServiceById = async (id: string) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const createOrUpdateService = async (service: Service) => {
  let response;
  if (service.id) {
    response = await api.put(`/services/${service.id}`, service);
  } else {
    response = await api.post('/services', service);
  }
  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};