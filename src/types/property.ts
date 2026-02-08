import { Subject } from "./subject"

export interface CadastralData {
  municipality: string;
  municipalityCode: string;
  category: string;
  sheet: string;
  parcel: string;
  subaltern?: string | null;
}

export interface Property {
  id?: string; // UUID della property
  name: string;
  address: string;
  city: string;
  province?: string;
  zip?: string;
  country?: string;
  municipalityCode?: string,
  municipality?: string,
  latitude?: number | null;
  longitude?: number | null;

  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | string;
  buildingType: 'APARTMENT' | 'DETACHED_HOUSE' | 'SEMI_DETACHED' | 'TERRACED' | 'CONDOMINIUM' | 'FARMHOUSE' | string;
  usageDestination: 'MAIN_RESIDENCE' | 'SECOND_HOME' | 'RENTAL' | 'OFFICE' | 'COMMERCIAL' | 'WAREHOUSE' | string;
  conditionStatus: 'NEW' | 'GOOD' | 'RENOVATED' | 'TO_RENOVATE' | 'POOR' | string,
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


  seismicClass?: string;
  isHistoricalBuilding?: boolean;
  isHabitable?: boolean;
  hasAgibility?: boolean;
  energyUsageType: string;
  cadastralData: CadastralData[];

  ownerId: string;
  notes?: string;
  owner: Subject;
  createdAt?: string;
  updatedAt?: string;
}
