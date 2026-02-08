import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { fetchSubjects, fetchSubjectsByClientId } from "@/api/subjects";
import { Subject } from "@/types/subject";
import { Client } from "@/types/client";

interface SubjectSelectorProps {
  onSelectSubject: (subject: Subject) => void;
  client?: Client;
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

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  onSelectSubject,
  client
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (client)
      fetchSubjectsByClientId(client.id).then(res => setSubjects(res.data));
    else
      fetchSubjects().then(res => setSubjects(res.data));
  }, []);

  const filtered = subjects.filter(s => {
    const searchable = `
      ${s.firstName ?? ""}
      ${s.lastName ?? ""}
      ${s.companyName ?? ""}
      ${s.taxCode ?? ""}
      ${s.vatNumber ?? ""}
    `.toLowerCase();

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
        {client && <p>Soggetti associati al cliente {client.companyName} {client.firstName} {client.lastName}</p>}
        <div className="p-2 space-y-2">
          {filtered.map(subject => (
            <div
              key={subject.id}
              onClick={() => onSelectSubject(subject)}
              className="flex items-start justify-between gap-4 p-4 rounded-lg cursor-pointer
                         hover:bg-accent transition-colors border"
            >
              {/* LEFT */}
              <div className="space-y-1">
                {/* Nome principale */}
                {subject.type === "PHYSICAL" && (
                  <div className="text-base font-semibold leading-tight">
                    {highlight(
                      `${subject.lastName ?? ""} ${subject.firstName ?? ""}`,
                      search
                    )}
                  </div>
                )}

                {subject.type === "LEGAL" && (
                  <div className="text-base font-semibold leading-tight">
                    {highlight(subject.companyName ?? "", search)}
                  </div>
                )}

                {/* Codici */}
                {subject.taxCode && (
                  <div className="text-sm text-muted-foreground">
                    CF: {highlight(subject.taxCode, search)}
                  </div>
                )}

                {subject.vatNumber && (
                  <div className="text-sm text-muted-foreground">
                    P.IVA: {highlight(subject.vatNumber, search)}
                  </div>
                )}

                {/* Responsabile */}
                {subject.type === "LEGAL" &&
                  (subject.firstName || subject.lastName) && (
                    <div className="text-xs text-muted-foreground">
                      Resp.: {subject.firstName} {subject.lastName}
                    </div>
                  )}
              </div>

              {/* RIGHT – Badge */}
              <Badge
                className="shrink-0"
                variant={subject.type === "PHYSICAL" ? "secondary" : "default"}
              >
                {subject.type === "PHYSICAL"
                  ? "Persona fisica"
                  : "Persona giuridica"}
              </Badge>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nessun soggetto trovato
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};