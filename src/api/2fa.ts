import api from './axiosInstance';


export const generate = async () => {
  const response = await api.get('/auth/2fa/generate');
  return response.data;
};

export const disable = async () => {
  const response = await api.post('/auth/2fa/disable');
  return response.data;
};

export const enable = async (verificationCode: String) => {
  const response = await api.post('/auth/2fa/setup', {token:verificationCode});
  return response.data;
};

export const status = async () => {
  const response = await api.post('/auth/2fa/verify');
  return response.data;
};

export const verify = async (tempToken:String, otp: String) =>{
  console.log(tempToken,  otp);
   const response = await api.post('/auth/2fa/verify', { tempToken,  otp},);
  return response.data;
}
