import { useEffect, useState } from "react"

import dayjs from "dayjs"

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
import { User, Building, Sparkles } from "lucide-react"


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
    <Card
      onClick={() => router.push("/subjects/" + subject.id)}
      className={`w-full cursor-pointer transition border
    hover:shadow-lg hover:border-primary/40
    ${isRecent ? "border-primary/50 bg-primary/5" : ""}
  `}
    >
      <CardContent className="p-4 grid grid-cols-[1fr_auto_auto] items-center gap-6">

        {/* LEFT — Identità */}
        <div className="flex items-start gap-3 min-w-0">

          {/* Icona tipo */}
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

          {/* Testi */}
          <div className="flex flex-col min-w-0 gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold truncate">
                {subjectName}
              </div>

              <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                {subject.type === "PHYSICAL"
                  ? "PERSONA FISICA"
                  : "PERSONA GIURIDICA"}
              </Badge>

              {isRecent && (
                <Badge
                  variant="outline"
                  className="h-5 px-2 text-[10px] gap-1 text-primary border-primary/40"
                >
                  <Sparkles className="h-3 w-3" />
                  Nuovo
                </Badge>
              )}
            </div>

            {subject.taxCode && (
              <div className="text-xs text-muted-foreground truncate">
                CF: <span className="font-mono">{subject.taxCode}</span>
              </div>
            )}
          </div>
        </div>

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

        {/* RIGHT — Data */}
        <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
          <div>Inserito il</div>
          <div className="font-medium text-foreground">
            {dayjs(subject.createdAt).format("DD/MM/YYYY")}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

export default SubjectItem