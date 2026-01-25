import { Badge } from "@/components/ui/badge";
import { ArrowUpNarrowWide } from "lucide-react";

type EnergyClass =
  | "A4"
  | "A3"
  | "A2"
  | "A1"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G";

const ENERGY_CLASS_STYLES: Record<
  EnergyClass,
  { label: string; className: string }
> = {
  A4: { label: "A4", className: "bg-green-700 text-white" },
  A3: { label: "A3", className: "bg-green-600 text-white" },
  A2: { label: "A2", className: "bg-green-500 text-white" },
  A1: { label: "A1", className: "bg-green-400 text-white" },
  B: { label: "B", className: "bg-lime-400 text-black" },
  C: { label: "C", className: "bg-yellow-400 text-black" },
  D: { label: "D", className: "bg-yellow-500 text-black" },
  E: { label: "E", className: "bg-orange-400 text-black" },
  F: { label: "F", className: "bg-orange-600 text-white" },
  G: { label: "G", className: "bg-red-600 text-white" },
};

interface EnergyClassBadgeProps {
  value?: string | null;
}

export function EnergyClassBadge({ value }: EnergyClassBadgeProps) {
  if (!value || !(value in ENERGY_CLASS_STYLES)) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Classe energetica —
      </Badge>
    );
  }

  const energy = ENERGY_CLASS_STYLES[value as EnergyClass];

  return (
    <Badge
      className={`flex items-center gap-1 px-3 py-1 ${energy.className}`}
    >
      <ArrowUpNarrowWide className="h-3 w-3" />
      Classe {energy.label}
    </Badge>
  );
}