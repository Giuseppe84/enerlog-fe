import api from './axiosInstance';

export const fetchPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

export const fetchPaymentById = async (id: string) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

export const createOrUpdatePayment = async (payment: {
  id?: string;
  isRefund: boolean;
  paymentMethod: string;
  paymentStatus: string;
  clientId?: string;
  workPayments: { workId: string; amountPaid: number; }[];
}) => {
  let response;
  if (payment.id) {
    response = await api.put(`/payments/${payment.id}`, payment);
  } else {
    response = await api.post('/payments', payment);
  }
  return response.data;
};

export const deletePayment = async (id: string) => {
  const response = await api.delete(`/payments/${id}`);
  return response.data;
};

