import { ClientSelector } from '@/components/fields/client-selector';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from '@/types/client';
import type { OrdersFilter } from "@/types/order";
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { Filter, Search, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";



interface SearchWithFiltersProps {
  filters: OrdersFilter;
  setFilters: Dispatch<SetStateAction<OrdersFilter>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function SearchWithFilters({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
}: SearchWithFiltersProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isClientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {

    const clientId = client?.id;
    setFilters((prev) => ({
      ...prev,
      clientId
    }));

  }, [client]);
  const applyFilters = () => {
    console.log("Filtri applicati:", filters, "Termine:", searchTerm);
    setPopoverOpen(false);
  };

  const setDateRange = (monthsAgo?: number, type?: 'today' | 'week' | 'month') => {
    const today = new Date();
    let startDate = today;
    let endDate = today;

    if (monthsAgo) {
      startDate = subMonths(today, monthsAgo);
    } else if (type === 'today') {
      startDate = today;
      endDate = today;
    } else if (type === 'week') {
      startDate = startOfWeek(today, { weekStartsOn: 1 }); // lunedì inizio settimana
      endDate = endOfWeek(today, { weekStartsOn: 1 });
    } else if (type === 'month') {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    }

    setFilters((prev) => ({
      ...prev,
      createdAfter: format(startDate, "yyyy-MM-dd"),
      createdBefore: format(endDate, "yyyy-MM-dd"),
    }));
  };

  const resetFilters = () => {
    setFilters({
      clientId: "",
      status: "",
      unpaidOnly: false,
      createdAfter: "",
      createdBefore: "",
    });
    setSearchTerm("");
    setPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Input con icona di ricerca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cerca ordine"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Popover filtri */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filtri
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-3 text-sm">

            {/* Client ID */}
            <div>

              <Card onClick={() => setClientSelectorOpen(true)} className="p-4 text-sm text-muted-foreground">
                <span>
                  {client
                    ? `${client.companyName ?? ""} ${client.firstName ?? ""} ${client.lastName ?? ""}`.trim()
                    : "Seleziona cliente"}
                </span>
              </Card>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="DRAFT">In bozza</SelectItem>
                  <SelectItem value="PENDING">In attesa</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progresso</SelectItem>
                  <SelectItem value="COMPLETED">Completati</SelectItem>
                  <SelectItem value="CANCELLED">Cancellati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Solo non pagati */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="unpaidOnly"
                checked={filters.unpaidOnly || false}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    unpaidOnly: Boolean(checked),
                  }))
                }
              />
              <Label htmlFor="unpaidOnly">Solo non pagati</Label>
            </div>

            {/* Pulsanti rapidi per date */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setDateRange(0, 'today')}>
                Oggi
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDateRange(0, 'week')}>
                Questa settimana
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDateRange(0, 'month')}>
                Questo mese
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDateRange(3)}>
                Ultimi 3 mesi
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDateRange(6)}>
                Ultimi 6 mesi
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDateRange(12)}>
                Ultimo anno
              </Button>
            </div>

            {/* Date manuali */}
            <div>
              <Label>Creato dopo</Label>
              <Input
                type="date"
                name="createdAfter"
                value={filters.createdAfter || ""}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <Label>Creato prima</Label>
              <Input
                type="date"
                name="createdBefore"
                value={filters.createdBefore || ""}
                onChange={handleFilterChange}
              />
            </div>

            {/* Pulsanti Applica e Reset */}
            <div className="flex gap-2">
              <Button className="flex-1" variant="default" onClick={applyFilters}>
                Applica filtri
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={resetFilters}
              >
                <X className="mr-1 h-4 w-4" />
                Reset filtri
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={isClientSelectorOpen} onOpenChange={setClientSelectorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Seleziona soggetto</DialogTitle>
            <DialogDescription>
              Scegli il soggetto da associare all’immobile
            </DialogDescription>
          </DialogHeader>

          <ClientSelector
            onSelectClient={(client) => {
              console.log(client);
              setClient(client);
              setClientSelectorOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}