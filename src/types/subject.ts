export type SubjectsResponse = {
  data: Subject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ClientSubject={   client: {
            firstName?: string;
            lastName?: string;
            avatar?: String;
            companyName?:String;
        };
        isSamePerson: boolean;

}
export type Subject = {
    id: string;
    firstName: string;
    lastName: string;
    taxCode: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    type?: 'PHYSICAL' | 'LEGAL';
    birthPlace?: string;
    birthProvince?: string;
    address?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
    iban?: string;
    swift?: string;
    mobile?: string;
    pecEmail?: string;
    sdiCode?: string;
    vatNumber?: string;
    clients?:ClientSubject[];
    gender?: 'M' | 'F' | 'X';


    createdAt: string;
};
