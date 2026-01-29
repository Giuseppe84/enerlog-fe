// Tipo per un Tag
export interface Tag {
  id: number;
  name: string;
  color: string;      // es. "#FFFFFF"
  type?: string | null;
}

// Tipo per la pivot ServiceTag
export interface ServiceTag {
  serviceId: string;
  tagId: number;
  tag: Tag;           // il tag collegato
}

// Tipo per Service
export interface Service {
  id: string;
  code: string;
  color?: string | null;
  image?: string | null;
  icon?: string | null;
  description?: string | null;
  notes?: string | null;
  name: string;
  price: number;      // Decimal convertito in number
  isActive: boolean;
  url?: string | null;
  category: string;
  works: { id: string }[];   // array minimale dei lavori
  tags: ServiceTag[];        // tag collegati
  createdAt: string;         // ISO string
  updatedAt: string;         // ISO string
}