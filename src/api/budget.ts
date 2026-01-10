import api from './axiosInstance';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface BudgetData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Transaction[];
  chartData: {
    period: string;
    income: number;
    expenses: number;
  }[];
}

export const fetchBudgetData = async (period: 'weekly' | 'monthly' | 'yearly', startDate?: string, endDate?: string) => {
  const params: any = { period };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await api.get('/budget', { params });
  return response.data as BudgetData;
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  const response = await api.post('/budget/transactions', transaction);
  return response.data;
};

export const deleteTransaction = async (id: string) => {
  const response = await api.delete(`/budget/transactions/${id}`);
  return response.data;
};
