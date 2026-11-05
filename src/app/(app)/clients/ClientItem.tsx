import dayjs from "dayjs"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import type { Client } from "@/types/client"
import { fetchAvatar } from "@/api/clients"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

import { User, Building } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* -------------------------------------------------------
   Cache avatar (globale al file)
------------------------------------------------------- */
const avatarCache = new Map<string, string>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchCachedAvatar = async (clientId: string) => {
  if (avatarCache.has(clientId)) {
    return avatarCache.get(clientId)!
  }

  const url = await fetchAvatar(clientId)
  avatarCache.set(clientId, url)
  return url
}

/* -------------------------------------------------------
   Card singolo Subject
------------------------------------------------------- */
const ClientItem = ({ client }: { client: Client }) => {
  const router = useRouter();
  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  const isRecent = dayjs().diff(dayjs(client.createdAt), "day") <= 7

  return (
    <TableRow 
      onClick={() => router.push("/clients/" + client.id)}
      className={`cursor-pointer transition border hover:shadow-lg hover:border-primary/40 ${isRecent ? "border-primary/50 bg-primary/5" : ""}`}
    >
      <TableCell className="font-medium">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            client.type === "PHYSICAL"
              ? "bg-blue-500/10 text-blue-600"
              : "bg-violet-500/10 text-violet-600"
          }`}
        >
          {client.type === "PHYSICAL" ? (
            <User className="h-5 w-5" />
          ) : (
            <Building className="h-5 w-5" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-semibold truncate">
          {clientName || client.companyName}
        </div>
      </TableCell>
      <TableCell>
        {client.type === 'PHYSICAL' && (
          <div className="truncate">
            <div className="text-xs font-extralight truncate">
              {client.taxCode}
            </div>
            <div className="text-xs text-muted-foreground">
              {client.type}
            </div>
          </div>
        )}

        {client.type === 'LEGAL' && (
          <div className="truncate">
            <div className="text-xs font-extralight truncate">
              {client.vatNumber} / {client.taxCode}
            </div>
            <div className="text-xs text-muted-foreground">
              {client.type}
            </div>
          </div>
        )}
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {dayjs(client.createdAt).format("DD/MM/YYYY")}
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Apri menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Azioni</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(client.id)}
            >
              Copia ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/clients/" + client.id)}>Visualizza dettagli</DropdownMenuItem>
            <DropdownMenuItem>Modifica</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default ClientItem