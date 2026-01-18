import api from './axiosInstance';
import type {Municipality, PostalCode } from '@/types/municipality';

export const searchMunicipality = async (query: string):Promise<PostalCode[]> => {
  const response = await api.get(`/postalcode/autocomplete?term=${query}`);
  return response.data;
};


export const fetchMunicipalityByIstatCode = async (istatCode: string):Promise<Municipality> => {
  const response = await api.get(`/municipalities/${istatCode}`);
  return response.data;
}

export const fetchAllMunicipalities = async ():Promise<Municipality[]> => {
  const response = await api.get('/municipalities');
  return response.data;
}
export const fetchAllPostalCodes = async ():Promise<PostalCode[]> => {
  const response = await api.get('/postal-codes');
  return response.data;
}
