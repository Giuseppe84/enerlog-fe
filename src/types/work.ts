export interface Work {
  id?: string;
  description: string;
  acquisitionDate: string;
  completionDate: string | null;
  status: 'TO_START' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  amount: number;
  clientId: string;
  propertyId: string;
  serviceId: string;
  subjectId: string;
  createdAt?: string;
  updatedAt?: string;
}