import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

import { Filter, Search, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

import type { PracticesFilter } from "@/types/practices";
import type { Client } from "@/types/client";
import type { Subject } from "@/types/subject";

import { ClientSelector } from "@/components/fields/client-selector";
import { SubjectSelector } from "@/components/fields/subject-selector";

interface SearchWithPracticeFiltersProps {
    filters: PracticesFilter;
    setFilters: Dispatch<SetStateAction<PracticesFilter>>;
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function SearchWithPracticeFilters({
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
}: SearchWithPracticeFiltersProps) {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const [client, setClient] = useState<Client | null>(null);
    const [subject, setSubject] = useState<Subject | null>(null);

    const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
    const [subjectSelectorOpen, setSubjectSelectorOpen] = useState(false);

    /* ----------------------- sync selettori ----------------------- */

    useEffect(() => {
        setFilters((prev) => ({ ...prev, clientId: client?.id }));
    }, [client]);

    useEffect(() => {
        setFilters((prev) => ({ ...prev, subjectId: subject?.id }));
    }, [subject]);

    /* ----------------------- date helper ----------------------- */

    const setDateRange = (
        fromKey: keyof PracticesFilter,
        toKey: keyof PracticesFilter,
        monthsAgo?: number
    ) => {
        const today = new Date();
        const from = monthsAgo ? subMonths(today, monthsAgo) : startOfMonth(today);
        const to = monthsAgo ? today : endOfMonth(today);

        setFilters((prev) => ({
            ...prev,
            [fromKey]: format(from, "yyyy-MM-dd"),
            [toKey]: format(to, "yyyy-MM-dd"),
        }));
    };

    /* ----------------------- reset ----------------------- */

    const resetFilters = () => {
        setFilters({});
        setSearchTerm("");
        setClient(null);
        setSubject(null);
        setPopoverOpen(false);
    };

    /* ----------------------- render ----------------------- */

    return (
        <div className="flex items-center gap-2">
            {/* SEARCH */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Cerca pratica"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setFilters((prev) => ({
                            ...prev,
                            query: e.target.value,
                        }));
                    }}
                    className="pl-10"
                />
            </div>

            {/* FILTRI */}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1">
                        <Filter className="h-4 w-4" />
                        Filtri
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-96">
                    <div className="flex flex-col gap-4 text-sm">

                        {/* CLIENTE */}
                        <div>
                            <Label>Cliente</Label>
                            <Card
                                onClick={() => setClientSelectorOpen(true)}
                                className="p-3 cursor-pointer text-muted-foreground"
                            >
                                {client
                                    ? `${client.companyName ?? ""} ${client.firstName ?? ""} ${client.lastName ?? ""}`.trim()
                                    : "Seleziona cliente"}
                            </Card>
                        </div>

                        {/* SOGGETTO */}
                        <div>
                            <Label>Soggetto</Label>
                            <Card
                                onClick={() => setSubjectSelectorOpen(true)}
                                className="p-3 cursor-pointer text-muted-foreground"
                            >
                                {subject
                                    ? `${subject.firstName} ${subject.lastName}`
                                    : "Seleziona soggetto"}
                            </Card>
                        </div>

                        {/* CODICE PRATICA */}
                        <div>
                            <Label>Codice pratica</Label>
                            <Input
                                value={filters.practiceCode || ""}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        practiceCode: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* STATUS */}
                        <div>
                            <Label>Stato</Label>
                            <Select
                                value={filters.status || "all"}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: value === "all" ? undefined : value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tutti" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tutti</SelectItem>
                                    <SelectItem value="DRAFT">Bozza</SelectItem>
                                    <SelectItem value="PLANNED">Pianificato</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In corso</SelectItem>
                                    <SelectItem value="SUSPENDED">Sospeso</SelectItem>
                                    <SelectItem value="COMPLETED">Completo</SelectItem>
                                    <SelectItem value="CANCELLED">Cancellato</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        {/* TYPE */}
                        <div>
                            <Label>Tipo</Label>
                            <Select
                                value={filters.type || "all"}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        type: value === "all" ? undefined : value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tutti" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tutti</SelectItem>
                                    <SelectItem value="CONTO_TERMICO">Conto termico</SelectItem>
                                    <SelectItem value="APE">Attestato di prestazione energetica</SelectItem>
                                    <SelectItem value="ENEA">Pratiche di detrazione fiscale</SelectItem>
                                    <SelectItem value="FV_CONNESSIONE">Pratiche allaccio impianto fotovoltaico</SelectItem>
                                    <SelectItem value="L10">Calcoli energetici</SelectItem>
                                    <SelectItem value="PG_EL">Progetto impianti enettrici</SelectItem>
                                    <SelectItem value="PG_CL">Progetto impianti climatizzazione</SelectItem>
                                    <SelectItem value="PT_MET">Pratica allaggio gas</SelectItem>
                                    <SelectItem value="GENERIC">Generica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        {/* DATE CREAZIONE */}
                        <div>
                            <Label>Data creazione</Label>
                            <div className="flex gap-2 flex-wrap mt-1">
                                <Button size="sm" variant="outline" onClick={() => setDateRange("fromDate", "toDate")}>
                                    Questo mese
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setDateRange("fromDate", "toDate", 6)}>
                                    Ultimi 6 mesi
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setDateRange("fromDate", "toDate", 12)}>
                                    Ultimo anno
                                </Button>
                            </div>
                        </div>

                        {/* AZIONI */}
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={() => setPopoverOpen(false)}>
                                Applica filtri
                            </Button>
                            <Button className="flex-1" variant="destructive" onClick={resetFilters}>
                                <X className="mr-1 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* CLIENT SELECTOR */}
            <Dialog open={clientSelectorOpen} onOpenChange={setClientSelectorOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Seleziona cliente</DialogTitle>
                        <DialogDescription>Scegli il cliente</DialogDescription>
                    </DialogHeader>
                    <ClientSelector
                        onSelectClient={(c) => {
                            setClient(c);
                            setClientSelectorOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* SUBJECT SELECTOR */}
            <Dialog open={subjectSelectorOpen} onOpenChange={setSubjectSelectorOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Seleziona soggetto</DialogTitle>
                        <DialogDescription>Scegli il soggetto</DialogDescription>
                    </DialogHeader>
                    <SubjectSelector
                        onSelectSubject={(s) => {
                            setSubject(s);
                            setSubjectSelectorOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}