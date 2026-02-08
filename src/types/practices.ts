import type {Property} from "./property"
import type {Service} from './service'


export interface Practice {
    id: string
    name: string
    description: string
    status: string
    type: string
    amount: string
    startDate: string | null
    endDate: string | null
    createdAt: string
    updatedAt: string
    ctPractice: {
        practiceCode: string | null
        status: string
        incentiveAmount: string
        iban: string
    } | null
    contributors: Array<{
        role: string
        client: {
            id: string | null
            firstName: string | null
            lastName: string | null
            companyName: string | null
        }
    }>
    subject: {
        id: string | null
        firstName: string | null
        lastName: string | null
        companyName: string | null
    }
    service: Service,
    property: Property,
    order: {
        totalAmount: string
        paidAmount: string
        status: string
    }
}

export interface PracticesData {
    data: Practice[]
    meta: {
        total: number
        page: number
        limit: number
        pages: number
    }
}

export type PracticesFilter = {
  query:string,
  page?: number,
  limit?: number,
  clientId?: string,
  subjectId?:string,
  interventionTypeId?:string,
  practiceCode?:string,
  type?:string,
  status?: string,
  ctStatus?:string,
  fromDate?: string,
  toDate?: string,
  submittedFromDate?: string,
  submittedToDate?: string,
  approvedFromDate?: string,
  approvedToDate?: string,
  valueFromDate?: string,
  valueToDate?: string,
};


export type CTPractice = {
  id: string;
  practiceCode: string;
  interventionTypeId: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  submittedAt?: Date | null;
  valueDate?: Date | null;
  iban?: string | null;
  incentiveAmount?: number | null;
  amount?: number | null;
  mandatarySubjectId?: string | null;
  mandateForCollection: boolean;
  CTstatus: 'DRAFT'|'READY_TO_SUBMIT'|'SUBMITTED'|'UNDER_REVIEW'|'APPROVED'|'REJECTED'|'PAID';
  practice: Practice;
  practiceId: string;
};

export type CTPracticeInput = Practice & CTPractice;