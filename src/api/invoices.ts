import api from './axiosInstance';

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description?: string;
  createdAt: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  paidAmount: number;
  pendingInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
}

export interface MonthlyInvoiceData {
  month: string;
  count: number;
  amount: number;
}

export interface InvoiceDashboardData {
  stats: InvoiceStats;
  monthlyData: MonthlyInvoiceData[];
  invoices: Invoice[];
  availableYears: number[];
}

export const fetchInvoicesDashboard = async (year: number): Promise<InvoiceDashboardData> => {
  const response = await api.get(`/invoices/dashboard?year=${year}`);
  return response.data;
};

export const createInvoice = async (invoice: Partial<Invoice>): Promise<Invoice> => {
  const response = await api.post('/invoices', invoice);
  return response.data;
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
  const response = await api.put(`/invoices/${id}`, invoice);
  return response.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await api.delete(`/invoices/${id}`);
};

export interface DueInvoicesResponse {
  upcomingDue: Invoice[];
  overdue: Invoice[];
}

export const fetchDueInvoices = async (): Promise<DueInvoicesResponse> => {
  const response = await api.get('/invoices/due');
  return response.data;
};

export const sendDueInvoiceNotifications = async (): Promise<{ sent: number; failed: number }> => {
  const response = await api.post('/invoices/send-notifications');
  return response.data;
};

export interface InvoiceReport {
  period: string;
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageInvoiceValue: number;
  paymentRate: number;
  topClients: Array<{ clientName: string; totalAmount: number; invoiceCount: number }>;
  monthlyTrend: Array<{ month: string; count: number; amount: number }>;
}

export const fetchInvoiceReport = async (startDate: string, endDate: string): Promise<InvoiceReport> => {
  const response = await api.get(`/invoices/report?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};
