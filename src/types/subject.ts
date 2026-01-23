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
export type SubjectBase = {
  id?: string

  address?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string

  email?: string
  phone?: string
  pecEmail?: string

  birthDate?: Date
  birthPlace?: string
  birthProvince?: string

  legalTaxCode?: string
  legalAddress?: string
  legalCity?: string
  legalProvince?: string
  legalPostalCode?: string
  legalForm?: string

  reaNumber?: string
  sdiCode?: string
  iban?: string
  swift?: string

  isDeleted?: boolean
}


export type PhysicalSubject = SubjectBase & {
  type: "PHYSICAL"

  firstName: string
  lastName: string
  taxCode: string

  companyName?: never
  vatNumber?: never
}
export type LegalSubject = SubjectBase & {
  type: "LEGAL"

  companyName: string
  vatNumber: string

  firstName?: never
  lastName?: never
  taxCode?: never
}

export type SubjectInput = PhysicalSubject | LegalSubject