import axiosInstance from './axiosInstance';
import { dashboardMockAPI } from './dashboardMock';

// Interface per i dati della dashboard
export interface DashboardKPIResponse {
  activeWorks: {
    total: number;
    toStart: number;
    trend: string;
    isPositive: boolean;
  };
  monthlyRevenue: {
    current: number;
    target: number;
    trend: string;
    isPositive: boolean;
  };
  activeClients: {
    total: number;
    newThisMonth: number;
    trend: string;
    isPositive: boolean;
  };
  pendingPayments: {
    total: number;
    count: number;
    trend: string;
    isPositive: boolean;
  };
}

export interface RevenueChartResponse {
  monthlyData: {
    month: string;
    revenue: number;
  }[];
}

export interface RecentWork {
  id: string;
  description: string;
  acquisitionDate: string;
  completionDate: string | null;
  status: "TO_START" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  amount: number;
  amountPaid: number;
  paymentStatus: "PENDING" | "PARTIALLY_PAID" | "PAID";
  subjectId: string;
  clientId: string;
  propertyId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    id: string;
    address: string;
    city: string;
  };
  service: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    firstName: string;
    lastName: string;
    taxCode: string;
  };
}

export interface RecentWorksResponse {
  works: RecentWork[];
}

export interface PendingPayment {
  id: string;
  description: string;
  status: string;
  amount: number;
  amountPaid: number;
  paymentStatus: "PENDING" | "PARTIALLY_PAID";
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    address: string;
    city: string;
  };
  service: {
    name: string;
  };
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingPaymentsResponse {
  payments: PendingPayment[];
}

// Dashboard API client
export const dashboardAPI = {
  // KPI principali della dashboard
  getKPIs: async (): Promise<DashboardKPIResponse> => {
    try {
      const response = await axiosInstance.get('/dashboard/kpi');
      return response.data;
    } catch (error) {
      console.warn('API dashboard/kpi non disponibile, uso dati mock:', error);
      return dashboardMockAPI.getKPIs();
    }
  },

  // Dati per il grafico del revenue
  getRevenue: async (period: string = 'monthly', year: number = new Date().getFullYear()): Promise<RevenueChartResponse> => {
    try {
      const response = await axiosInstance.get(`/dashboard/revenue?period=${period}&year=${year}`);
      return response.data;
    } catch (error) {
      console.warn('API dashboard/revenue non disponibile, uso dati mock:', error);
      return dashboardMockAPI.getRevenue();
    }
  },

  // Lavori recenti
  getRecentWorks: async (limit: number = 4): Promise<RecentWorksResponse> => {
    try {
      const response = await axiosInstance.get(`/dashboard/recent-works?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('API dashboard/recent-works non disponibile, uso dati mock:', error);
      return dashboardMockAPI.getRecentWorks();
    }
  },

  // Pagamenti in sospeso
  getPendingPayments: async (limit: number = 3): Promise<PendingPaymentsResponse> => {
    try {
      const response = await axiosInstance.get(`/dashboard/pending-payments?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('API dashboard/pending-payments non disponibile, uso dati mock:', error);
      return dashboardMockAPI.getPendingPayments();
    }
  },

  // Metodo combinato per ottenere tutti i dati della dashboard in una sola chiamata
  getDashboardData: async () => {
    try {
      const [kpiData, revenueData, recentWorksData, pendingPaymentsData] = await Promise.all([
        dashboardAPI.getKPIs(),
        dashboardAPI.getRevenue(),
        dashboardAPI.getRecentWorks(),
        dashboardAPI.getPendingPayments()
      ]);

      return {
        kpis: kpiData,
        revenue: revenueData,
        recentWorks: recentWorksData,
        pendingPayments: pendingPaymentsData
      };
    } catch (error) {
      console.error('Errore nel caricamento dei dati della dashboard:', error);
      throw error;
    }
  }
};

export default dashboardAPI;