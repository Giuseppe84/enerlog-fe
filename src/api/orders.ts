import api from './axiosInstance';
import {Order, OrdersResponse,OrdersFilter} from '@/types/order'



export const fetchOrders = async (filters: OrdersFilter):Promise<OrdersResponse> => {
  const response = await api.get('/orders', {
    params: filters,
  });
  return response.data;
};

export const fetchOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`,);
  return response.data;
};

export const createOrUpdateOrder = async (order: Order) => {
  let response;
  if (order.id) {
    response = await api.put(`/orders/${order.id}`, order);
  } else {
    response = await api.post('/orders', order);
  }
  return response.data;
};

export const deleteOrder = async (id: string) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};

