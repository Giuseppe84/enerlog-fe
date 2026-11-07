import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { fetchClients } from "@/api/clients";
import { Client } from "@/types/client";

interface ClientSelectorProps {
    onSelectClient: (client: Client) => void;
    skipCloseOnSelect?: boolean;
}

function highlight(text: string, search: string) {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-500/30 font-semibold">
                {part}
            </span>
        ) : (
            part
        )
    );
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
    onSelectClient,
}) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchClients().then(res => setClients(res.data));
    }, []);

    const filtered = clients.filter(s => {
        const searchable = [
            s.firstName,
            s.lastName,
            s.companyName,
            s.taxCode,
            s.vatNumber
        ]
            .filter(Boolean) // elimina null/undefined/empty string
            .join(" ")
            .toLowerCase();

        return searchable.includes(search.toLowerCase());
    });

    return (
        <div className="space-y-4">
            <Input
                placeholder="Cerca per nome, azienda, CF o P.IVA..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <ScrollArea className="h-[320px] border rounded-md">
                <div className="p-2 space-y-2">
                    {filtered.map(client => (
                        <div
                            key={client.id}
                            onClick={() => onSelectClient(client)}
                            className="flex items-start justify-between gap-4 p-4 rounded-lg cursor-pointer
                         hover:bg-accent transition-colors border"
                        >
                            {/* LEFT */}
                            <div className="space-y-1">
                                {/* Nome principale */}
                                {client.type === "PHYSICAL" && (
                                    <div className="text-base font-semibold leading-tight">
                                        {highlight(
                                            `${client.lastName ?? ""} ${client.firstName ?? ""}`,
                                            search
                                        )}
                                    </div>
                                )}

                                {client.type === "LEGAL" && (
                                    <div className="text-base font-semibold leading-tight">
                                        {highlight(client.companyName ?? "", search)}
                                    </div>
                                )}

                                {/* Codici */}
                                {client.taxCode && (
                                    <div className="text-sm text-muted-foreground">
                                        CF: {highlight(client.taxCode, search)}
                                    </div>
                                )}

                                {client.vatNumber && (
                                    <div className="text-sm text-muted-foreground">
                                        P.IVA: {highlight(client.vatNumber, search)}
                                    </div>
                                )}

                                {/* Responsabile */}
                                {client.type === "LEGAL" &&
                                    (client.firstName || client.lastName) && (
                                        <div className="text-xs text-muted-foreground">
                                            Resp.: {client.firstName} {client.lastName}
                                        </div>
                                    )}
                            </div>

                            {/* RIGHT – Badge */}
                            <Badge
                                className="shrink-0"
                                variant={client.type === "PHYSICAL" ? "secondary" : "default"}
                            >
                                {client.type === "PHYSICAL"
                                    ? "Persona fisica"
                                    : "Persona giuridica"}
                            </Badge>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            Nessun cliente trovato
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};