import { 
  DashboardKPIResponse, 
  RevenueChartResponse, 
  RecentWorksResponse, 
  PendingPaymentsResponse 
} from './dashboard';

// Mock data per la dashboard
export const mockKPIData: DashboardKPIResponse = {
  activeWorks: {
    total: 24,
    toStart: 2,
    trend: "+12% vs mese scorso",
    isPositive: true
  },
  monthlyRevenue: {
    current: 18900,
    target: 25000,
    trend: "+8.2% vs mese scorso",
    isPositive: true
  },
  activeClients: {
    total: 48,
    newThisMonth: 3,
    trend: "+6.3% vs mese scorso",
    isPositive: true
  },
  pendingPayments: {
    total: 4125,
    count: 3,
    trend: "-15% vs mese scorso",
    isPositive: true
  }
};

export const mockRevenueData: RevenueChartResponse = {
  monthlyData: [
    { month: "Gen", revenue: 12400 },
    { month: "Feb", revenue: 15800 },
    { month: "Mar", revenue: 18200 },
    { month: "Apr", revenue: 14500 },
    { month: "Mag", revenue: 19800 },
    { month: "Giu", revenue: 22100 },
    { month: "Lug", revenue: 20500 },
    { month: "Ago", revenue: 16200 },
    { month: "Set", revenue: 24300 },
    { month: "Ott", revenue: 26700 },
    { month: "Nov", revenue: 18900 }
  ]
};

export const mockRecentWorksData: RecentWorksResponse = {
  works: [
    { 
      "id": "cmge93mio000rsbdlxk9xibc2", 
      "description": "Audit energetico edificio", 
      "acquisitionDate": "2025-06-15T00:00:00.000Z", 
      "completionDate": null, 
      "status": "TO_START", 
      "amount": 2000, 
      "amountPaid": 2000, 
      "paymentStatus": "PAID", 
      "subjectId": "cmge93m5n0005sbdl4jfgqcqi", 
      "clientId": "cmge93m0r0001sbdllhlxmaeq", 
      "propertyId": "cmge93mdg000hsbdlp59lpe9l", 
      "serviceId": "cmge93mhc000nsbdlgdor0bly", 
      "createdAt": "2025-10-05T22:05:39.649Z", 
      "updatedAt": "2025-10-12T20:56:30.395Z", 
      "userId": null, 
      "client": { 
        "id": "cmge93m0r0001sbdllhlxmaeq", 
        "firstName": "Luigi", 
        "lastName": "Verdi", 
        "email": "luigi.verdi@example.com" 
      }, 
      "property": { 
        "id": "cmge93mdg000hsbdlp59lpe9l", 
        "address": "Via Milano 10", 
        "city": "Tiggiano" 
      }, 
      "service": { 
        "id": "cmge93mhc000nsbdlgdor0bly", 
        "name": "Analisi Fattibilità" 
      }, 
      "subject": { 
        "id": "cmge93m5n0005sbdl4jfgqcqi", 
        "firstName": "Sara", 
        "lastName": "Verdi", 
        "taxCode": "VRDSRA85C45H501R" 
      } 
    }, 
    { 
      "id": "cmge93mia000psbdl0jir64j8", 
      "description": "Installazione pannelli solari", 
      "acquisitionDate": "2025-06-01T00:00:00.000Z", 
      "completionDate": null, 
      "status": "TO_START", 
      "amount": 5000, 
      "amountPaid": 2000, 
      "paymentStatus": "PENDING", 
      "subjectId": "cmge93m4l0004sbdlw6hf0jxi", 
      "clientId": "cmge93lzb0000sbdl0890jmi7", 
      "propertyId": "cmge93mcg000fsbdlsh6bvngf", 
      "serviceId": "cmge93mfw000msbdl80h316tc", 
      "createdAt": "2025-10-05T22:05:39.634Z", 
      "updatedAt": "2025-11-01T00:31:14.004Z", 
      "userId": null, 
      "client": { 
        "id": "cmge93lzb0000sbdl0890jmi7", 
        "firstName": "Mario", 
        "lastName": "Rossi", 
        "email": "mario.rossi@example.com" 
      }, 
      "property": { 
        "id": "cmge93mcg000fsbdlsh6bvngf", 
        "address": "Via Roma 1", 
        "city": "Corsano" 
      }, 
      "service": { 
        "id": "cmge93mfw000msbdl80h316tc", 
        "name": "Consulenza Energetica" 
      }, 
      "subject": { 
        "id": "cmge93m4l0004sbdlw6hf0jxi", 
        "firstName": "Luca", 
        "lastName": "Bianchi", 
        "taxCode": "BNCLCU90E10H501P" 
      } 
    } 
  ]
};

export const mockPendingPaymentsData: PendingPaymentsResponse = {
  payments: [
    {
      id: "cmge93mia000psbdl0jir64j8",
      description: "Installazione pannelli solari",
      status: "TO_START",
      amount: 5000,
      amountPaid: 2000,
      paymentStatus: "PENDING",
      client: {
        firstName: "Mario",
        lastName: "Rossi",
        email: "mario.rossi@example.com"
      },
      property: {
        address: "Via Roma 1",
        city: "Corsano"
      },
      service: {
        name: "Consulenza Energetica"
      },
      remainingAmount: 3000,
      createdAt: "2025-06-01T00:00:00.000Z",
      updatedAt: "2025-11-01T00:31:14.004Z"
    }
  ]
};

// Mock API client con delay simulato
export const dashboardMockAPI = {
  getKPIs: async (): Promise<DashboardKPIResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockKPIData;
  },

  getRevenue: async (): Promise<RevenueChartResponse> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockRevenueData;
  },

  getRecentWorks: async (): Promise<RecentWorksResponse> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockRecentWorksData;
  },

  getPendingPayments: async (): Promise<PendingPaymentsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 450));
    return mockPendingPaymentsData;
  },

  getDashboardData: async () => {
    try {
      const [kpiData, revenueData, recentWorksData, pendingPaymentsData] = await Promise.all([
        dashboardMockAPI.getKPIs(),
        dashboardMockAPI.getRevenue(),
        dashboardMockAPI.getRecentWorks(),
        dashboardMockAPI.getPendingPayments()
      ]);

      return {
        kpis: kpiData,
        revenue: revenueData,
        recentWorks: recentWorksData,
        pendingPayments: pendingPaymentsData
      };
    } catch (error) {
      console.error('Errore nel caricamento dei dati mock della dashboard:', error);
      throw error;
    }
  }
};