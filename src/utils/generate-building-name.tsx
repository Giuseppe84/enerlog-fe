interface BuildingNameParams {
  ownerName?: string;
  address?: string;
  city?: string;
  buildingType?: string;
}

export function generateBuildingName({
  ownerName,
  address,
  city,
  buildingType,
}: BuildingNameParams): string {
  return [
    ownerName ? `Edificio ${ownerName}` : null,
    address,
    city,
    buildingType,
  ]
    .filter(Boolean)
    .join(" – ");
}