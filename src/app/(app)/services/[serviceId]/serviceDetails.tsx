import React from "react";
import { Service, ServiceTag } from "@/types/service"; // importa il tipo
import { Card, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
interface ServiceDetailProps {
  service: Service;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ service }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="relative overflow-hidden">
        {/* Immagine di copertina */}
        {service.image && (
          <div className="relative">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-64 object-cover brightness-60 grayscale dark:brightness-20"
            />
            {/* Overlay nome e icona */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              {service.icon && (
                <img
                  src={service.icon}
                  alt="Icon"
                  className="w-12 h-12 rounded-full border-2 border-amber-300"
                />
              )}
              <div className="text-white">
                <h1 className="text-2xl font-bold">{service.name}</h1>
                {service.description && <p className="text-sm opacity-80">{service.description}</p>}
              </div>
            </div>
            {/* Linea gialla */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-amber-300 z-30" />
          </div>
        )}
        {service.icon && (
          <img
            src={service.icon}
            alt="Icon"
            className="w-12 h-12 rounded-full border-2 border-amber-300"
          />
        )}
        {/* Card content */}
        <CardHeader className="mt-4">
          <div className="flex justify-between items-center">
            <Badge variant="secondary">{service.category}</Badge>
            <span className={`font-bold ${service.isActive ? "text-green-600" : "text-red-600"}`}>
              {service.isActive ? "Attivo" : "Disattivo"}
            </span>
          </div>
          {service.notes && <CardDescription className="mt-2">{service.notes}</CardDescription>}
        </CardHeader>

        <CardFooter className="flex flex-col gap-2">
          {/* Prezzo */}
          <div className="text-lg font-semibold">Prezzo: €{service.price}</div>

          {/* Lista tag */}
          {service.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {service.tags.map((st: ServiceTag) => (
                <Badge key={st.tagId}>{st.tag.name}</Badge>
              ))}
            </div>
          )}

          {/* Lista lavori */}
          {service.works?.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold">Lavori collegati:</h3>
              <ul className="list-disc list-inside">
                {service.works.map((w) => (
                  <li key={w.id}>{w.id}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottone azione */}
          <Button className="w-full mt-4">Apri / Modifica</Button>
        </CardFooter>
      </Card>
    </div>
  );
};