import { useEffect, useState } from "react"


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

// 🔁 tipi (adatta se necessario)
import type { SubjectInput } from "@/types/subject"

// 🔁 funzione che già hai
import { fetchAvatar } from "@/api/clients"
import { useRouter } from "next/navigation";



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
const SubjectItem = ({ subject }: { subject: SubjectInput }) => {

  const [clientAvatars, setClientAvatars] = useState<Record<string, string>>({})
  const router = useRouter();
  
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
      className="h-30 w-50 flex flex-col items-center justify-center  cursor-pointer bg-gradient-to-t from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition"
      onClick={() => router.push("/subjects/" + subject.id)}
    >
      <CardContent className="p-4 m-3 flex flex-col items-start gap-2 text-center">

        <div className="flex-1 truncate">
          <div className="text-lg font-semibold truncate">
            {subject.firstName} {subject.lastName}
          </div>

          {subject.taxCode && (
            <div className="text-xs font-mono truncate pb-1">
              {subject.taxCode}
            </div>
          )}

          <Badge className="h-4 rounded-none px-2 text-xs font-light">
            {subject.type === "PHYSICAL"
              ? "PERSONA FISICA"
              : "PERSONA GIURIDICA"}
          </Badge>

          {/* Avatar clienti */}
          {subject.clients?.length > 0 && (
            <TooltipProvider>
              <div className="pt-2 flex -space-x-2">
                {subject.clients.map((item, index) => {
                  const client = item.client
                  const avatarUrl = clientAvatars[client.id]

                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Avatar
                          className="h-8 w-8 ring-2 ring-background grayscale hover:grayscale-0 transition"
                          onClick={(e) => e.stopPropagation()}
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
        </div>
      </CardContent>
    </Card>
  )
}

export default SubjectItem