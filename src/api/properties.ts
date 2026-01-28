
import type { Property, CadastralData } from '@/types/property';
import api from './axiosInstance';



export const fetchProperties = async ( page = 1,
  limit = 10,
  query?: string) => {
  try {
    const response = await api.get('/properties', {
    params: { page, limit, q: query },
  });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return []; // ← fallback corretto
    }
    throw error; // altri errori veri
  }
};

export const fetchPropertyById = async (id: string) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return []; // ← fallback corretto
    }
    throw error; // altri errori veri
  }
};


export const newProperty = async (property: Property) => {
  const response = await api.post('/properties', property);
  return response.data;
};


export const createOrUpdateProperty = async (property: Property) => {
  console.log('Updating property:', property);
  const propertyCopy = { ...property };

  delete propertyCopy.municipalityCode;
  delete propertyCopy.municipality;
  delete propertyCopy.createdAt;
  delete propertyCopy.updatedAt;
  if (!property.id) {
    // Creazione nuova property
    const response = await api.post('/properties', propertyCopy);
    return response.data;
  }

  console.log(propertyCopy);

  const response = await api.put(`/properties`, propertyCopy);
  return response.data;
};

export const deleteProperty = async (id: string) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};


export const fetchPropertiesBySubject = async (subjectId: string) => {
  const response = await api.get(`/properties/by-subject/${subjectId}`);
  return response.data;
};


// API to fetch properties by location (latitude, longitude, radius)
export const getPropertiesByLocation = async (
  latitude: number,
  longitude: number,
  radius: number
) => {
  const response = await api.post('/properties/location',
    {
      latitude,
      longitude,
      radius,
    },
  );
  return response.data;
};