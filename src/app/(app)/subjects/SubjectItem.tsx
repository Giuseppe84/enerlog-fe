import { useEffect, useState } from "react"

import dayjs from "dayjs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { Subject } from "@/types/subject"
import { fetchAvatar } from "@/api/clients"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText, Building2, MapPin } from "lucide-react"




import { User, Building, Sparkles } from "lucide-react"
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
const SubjectItem = ({ subject }: { subject: Subject }) => {

  const [clientAvatars, setClientAvatars] = useState<Record<string, string>>({})
  const router = useRouter();
  const subjectName = subject.companyName ? subject.companyName : `${subject.firstName || ''} ${subject.lastName || ''}`.trim();
   const subjectCode = subject.companyName ?  `P.IVA ${subject.vatNumber || ''} / CF ${subject.legalTaxCode || ''}`.trim() : subject.taxCode;
  const isRecent = dayjs().diff(dayjs(subject.createdAt), "day") <= 7
  useEffect(() => {
    const loadClientAvatars = async () => {
      if (!subject.clients?.length) return

      try {
        const results = await Promise.all(
          subject.clients.map(async (item) => {

            const clientId = item.client.id
            const avatarUrl = await fetchCachedAvatar(clientId)
            return [clientId, avatarUrl] as const
          })
        )

        setClientAvatars(Object.fromEntries(results))
      } catch (error) {
        console.error("Error loading client avatars", error)
      }
    }

    loadClientAvatars()
  }, [subject.clients])

  return (
    <TableRow onClick={() => router.push("/subjects/" + subject.id)}
      className={`cursor-pointer transition border
    hover:shadow-lg hover:border-primary/40
    ${isRecent ? "border-primary/50 bg-primary/5" : ""}
  `} >
      <TableCell className="font-medium">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center
          ${subject.type === "PHYSICAL"
              ? "bg-blue-500/10 text-blue-600"
              : "bg-violet-500/10 text-violet-600"
            }
        `}
        >
          {subject.type === "PHYSICAL" ? (
            <User className="h-5 w-5" />
          ) : (
            <Building className="h-5 w-5" />
          )}
        </div>
            </TableCell>
      <TableCell>
        <div className="font-semibold truncate">
          {subjectName}
        </div>
      </TableCell>
       <TableCell>
        <div className="text-sm text-muted-foreground">
          {subjectCode}
        </div>
      </TableCell>
      <TableCell>
        {/* CENTER — Avatar clienti */}
        {subject.clients?.length > 0 && (
          <TooltipProvider>
            <div className="flex -space-x-3">
              {subject.clients.map((item, index) => {
                const client = item.client
                const avatarUrl = clientAvatars[client.id]

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Avatar
                        onClick={(e) => e.stopPropagation()}
                        className="h-9 w-9 ring-2 ring-background
                      grayscale hover:grayscale-0 transition"
                      >
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-[10px]">
                          {client.firstName?.[0] ??
                            client.companyName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p className="text-xs">
                        {client.firstName
                          ? `${client.firstName} ${client.lastName}`
                          : client.companyName}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
        )}
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {dayjs(subject.createdAt).format("DD/MM/YYYY")}
      </TableCell>
      <TableCell className="text-right">
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
              onClick={() => navigator.clipboard.writeText(practice.id)}
            >
              Copia ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Visualizza dettagli</DropdownMenuItem>
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

export default SubjectItem