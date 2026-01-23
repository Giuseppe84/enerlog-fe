export type PersonType = 'NATURAL' | 'LEGAL';

type BaseClient = {
  id: string;
  phone?: string | null;
  email?: string | null;

  avatar?: string | null;


  primaryColor?: string | null;
  secondaryColor?: string | null;
  clientSubjects?: {
    subject: {
      id?: string;
      firstName: string;
      lastName: string;
    };
    isSamePerson: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
};



export type PhysicalPersonClient = BaseClient & {
  type: 'PHYSICAL';

  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country?: string | null;
  birthDate?: Date | null;
  birthPlace?: string | null;
  birthProvince?: string | null;
  gender?: string | null;
  tags?: {
    clientId: string;
    tagId: number;
    tag: {
      id: number;
      name: string;
      color: string;
    };
  }[];
  taxCode?: string | null;
};


export type LegalPersonClient = BaseClient & {
  type: 'LEGAL';
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  legalForm?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  reaNumber?: string | null;
  chamberCode?: string | null;

  sdiCode?: string | null;
  pecEmail?: string | null;

  legalAddress?: string | null;
  legalCivicNumber?: string | null;
  legalPostalCode?: string | null;
  legalCity?: string | null;
  legalProvince?: string | null;
  legalCountry?: string | null;
};

export type Client = BaseClient & (PhysicalPersonClient | LegalPersonClient);


export type ClientsResponse = {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};



