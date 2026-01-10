import api from './axiosInstance';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

import { pick } from '../utils/pick';


export interface UserProfile {
  firstName: string;
  lastName: string;
  companyName: string;
  taxCode: string;
  vatNumber: string;
  type: string;
  city: string;
  address: string;
  postalCode: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}



export const UserProfileAPI = {
  getProfile: async (): Promise<UserProfile> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trovato');
    }
    const response = await api.get(`/auth/profile`);
    return response.data;
  },

  updateProfile: async (newProfile: UserProfile): Promise<UserProfile> => {
  console.log('Updating settings with:', newProfile);

    const allowedKeys: (keyof UserProfile)[] = [
    'firstName', 'lastName', 'companyName', 'taxCode', 'vatNumber',
    'type', 'city', 'address', 'postalCode', 'province', 'zip', 'country',
    'phone', 'email'
  ];

  const payload = pick(newProfile, allowedKeys);

  
    const response = await api.put<{ message: string; user: UserProfile }>(
      `/auth/profile/update`,
      payload);
    return response.data.user;
  
  },
};