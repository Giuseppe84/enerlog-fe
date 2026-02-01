import { Client } from "./client"

export interface Order {
  id: string;
  code: string;
  status: 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  practices?: any[];
  ctPractices?: any[];
  fvPractices?: any[];

  payments?: any[];
  invoices?: any[];

  totalAmount: string; // Decimal(10,2)
  paidAmount: string;  // Decimal(10,2)

  clientId: string;
  client?: Client;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date

  _count?:OrderCount
}



export type OrdersResponse = {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total:number;
    totalPages: number;
  };
};
export type OrderCount = {
  practices: number;
  ctPractices: number;
  payments: number;
  invoices: number;
};

export type OrdersFilter = {
  page?: number,
  limit?: number,
  clientId?: string,
  status?: string,
  unpaidOnly?: boolean,
  createdAfter?: string,
  createdBefore?: string,
};

export type OrderCardProps = {
  order: {
    id: string;
    code: string;
    status: 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

    practices?: string[];
    ctPractices?: string[];
    fvPractices?: string[];

    payments?: string[];
    invoices?: string[];

    totalAmount: string; // Decimal(10,2)
    paidAmount: string;  // Decimal(10,2)

    clientId: string;
    client?: Client;

    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  }
}

