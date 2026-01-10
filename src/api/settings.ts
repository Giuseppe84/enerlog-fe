import api from './axiosInstance';
const backendUrl = process.env.NEXT_PUBLIC_API_URL;

export interface UserSettings {
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
  isTwoFactorEnabled: boolean;
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationToken: string;
}



export const settingsAPI = {
  getSettings: async (): Promise<UserSettings> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trovato');
    }
    const response = await api.get(`/auth/profile`);
    return response.data;
  },

  updateSettings: async (newSettings: UserSettings): Promise<UserSettings> => {
  console.log('Updating settings with:', newSettings);
  delete newSettings.role; // Rimuovi email dalle impostazioni da inviare
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trovato');
    }
    const response = await api.put(
      `/auth/profile/update`,
      newSettings);
    return response.data;
  },

  updatePassword: async ({oldPassword, newPassword}): Promise<UserSettings> => {

 
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trovato');
    }
    return await api.post(
      `/auth/change-password`,
      {oldPassword, newPassword});
  
  },

updateEmail: async ( {newEmail }): Promise<UserSettings> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token non trovato');
  }

  // Imposta l'Authorization header con il token se necessario
  return await api.post(
    `/auth/change-email`,
    { newEmail }
  );
},
sendPhoneChangeCode:async ( {newPhone }): Promise<UserSettings> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token non trovato');
  }

  // Imposta l'Authorization header con il token se necessario
  return await api.post(
    `/auth/phone/change/send`,
    { newPhone }
  );
},
verifyPhoneChange:async ( {code }): Promise<UserSettings> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token non trovato');
  }

  // Imposta l'Authorization header con il token se necessario
  return await api.post(
    `/auth/phone/change/verify`,
    { code }
  );
},

verifyEmailChange: async ( token: String): Promise<UserSettings> => {
  return await api.get("/auth/verify-email", {
    params: { token }
  });
},
addDevice: async (): Promise<UserSettings> => {
  return await api.post("/auth/trusted/add");
},
};