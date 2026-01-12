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



export const userAPI = {
  getUser: async (): Promise<UserSettings> => {

    const response = await api.get(`/users/settings`);
    console.log(response)
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me')
    console.log(response)
    return response.data;
  },

  login: async (email: string, password: string) => {

    const response = await api.post(`/auth/login`, { email, password });
    return response.data;
  },



  logout: async () => {


    const response = await api.post(
      `/auth/logout`,
    );
    return response.data;
  },


  updateSettings: async (newSettings: UserSettings): Promise<UserSettings> => {
    console.log('Updating settings with:', newSettings);

    const response = await api.put(
      `/auth/profile/update`,
      newSettings);
    return response.data;
  },

  updatePassword: async ({
    oldPassword,
    newPassword,
  }: {
    oldPassword: string
    newPassword: string
  }): Promise<UserSettings> => {
    return await api.post(`/auth/change-password`, { oldPassword, newPassword });
  },

  updateEmail: async (newEmail: string): Promise<UserSettings> => {

    // Imposta l'Authorization header con il token se necessario
    return await api.post(
      `/auth/change-email`,
      {newEmail}
    );
  },
  sendPhoneChangeCode: async (newPhone: string): Promise<UserSettings> => {

    // Imposta l'Authorization header con il token se necessario
    return await api.post(
      `/auth/phone/change/send`,
      newPhone
    );
  },
  verifyPhoneChange: async (code: string): Promise<UserSettings> => {

    // Imposta l'Authorization header con il token se necessario
    return await api.post(
      `/auth/phone/change/verify`,
      code
    );
  },

  verifyEmailChange: async (token: string): Promise<UserSettings> => {
    return await api.get("/auth/verify-email", {
      params: token
    });
  },
  addDevice: async (): Promise<UserSettings> => {
    return await api.post("/auth/trusted/add");
  },
};