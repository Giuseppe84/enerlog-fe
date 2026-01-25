import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Map, Calendar } from "lucide-react";
import dayjs from "dayjs";
import {EnergyClassBadge} from "@/components/energy-class-badge";
import { useRouter } from "next/navigation";




interface PropertyCardProps {
    property: {
        id:string,
        address: string,
        city: string,
        province: string,
        zip: number,
        energyClass: string,
        cadastralData?: {
            sheet?: string;
            parcel?: string;
            subaltern?: string;
            category?: string;
        };
        subject?: {
            firstName?: string;
            lastName?: string;
        };
        createdAt?: string;
    };
}

export function PropertyCard({ property }: PropertyCardProps) {
      const router = useRouter();


    return (
        <Card className="hover:shadow-md transition cursor-pointer"   onClick={() => router.push("/properties/" + property.id)}
        >
            <CardContent className="p-4 space-y-4">

                {/* Indirizzo */}
                <div className="flex justify-between gap-3">
                    <div className="flex flex-none gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                            <div className="text-sm font-semibold">
                                {property.address}
                            </div>
                            <div className="text-sm font-semibold">
                                {property.city}
                            </div>
                        </div>
                    </div>
                    <div className="size-14 flex-grow">
                        <EnergyClassBadge value={property.energyClass} />
                    </div>
                </div>


                {/* Dati catastali */}
                {property.cadastralData.map((item: any) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-3"
                    >
                        <Map className="h-5 w-5 text-muted-foreground mt-1" />

                        <div className="flex flex-wrap gap-2 text-xs">
                            {item.category && (
                                <Badge variant="secondary">
                                    Cat. {item.category}
                                </Badge>
                            )}
                            {item.sheet && (
                                <Badge variant="outline">
                                    Foglio {item.sheet}
                                </Badge>
                            )}
                            {item.parcel && (
                                <Badge variant="outline">
                                    Part. {item.parcel}
                                </Badge>
                            )}
                            {item.subaltern && (
                                <Badge variant="outline">
                                    Sub. {item.subaltern}
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}


                {/* Footer */}
                <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">

                    {/* Proprietario */}
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-foreground">
                            {property.subject
                                ? `${property.subject.firstName} ${property.subject.lastName}`
                                : "—"}
                        </span>
                    </div>

                    {/* Data inserimento */}
                    {property.createdAt && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {dayjs(property.createdAt).format("DD/MM/YYYY")}
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}