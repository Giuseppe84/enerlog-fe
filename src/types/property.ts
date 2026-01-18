export interface CadastralData {
  municipality: string;
  municipalityCode: string;
  category: string;
  sheet: string;
  parcel: string;
  subaltern?: string | null;
}

export interface Property {
  id: string; // UUID della property
  name: string;
  address: string;
  city: string;
  province?: string;
  zip?: string;
  country?: string;

  latitude?: number | null;
  longitude?: number | null;

  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | string;
  buildingType: 'APARTMENT' | 'HOUSE' | 'VILLA' | string;
  usageDestination: 'MAIN_HOME' | 'SECOND_HOME' | string;

  yearBuilt?: number;
  renovationYear?: number;
  floors?: number;
  totalUnits?: number;
  floorNumber?: number;

  hasElevator?: boolean;
  hasGarage?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasBalcony?: boolean;
  hasTerrace?: boolean;

  sup?: number;
  supCommercial?: number;
  supLand?: number;
  volume?: number;

  energyClass?: string;
  EPglren?: number;
  EPglnren?: number;
  co2?: number;
  heatingType?: string;
  coolingType?: string;
  energyConsumption?: number;
  hasPVSystem?: boolean;
  hasStorageSystem?: boolean;

  conditionStatus?: string;
  seismicClass?: string;
  isHistoricalBuilding?: boolean;
  isHabitable?: boolean;
  hasAgibility?: boolean;

  cadastralData: CadastralData[];

  ownerId: string;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}
