"use client"

import { useEffect, useState, useRef } from "react"
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

import { fetchAvatar } from "@/api/clients"

interface Contributor {
  role: string
  client: {
    id: string | null
    firstName: string | null
    lastName: string | null
    companyName: string | null
  }
}

interface ClientAvatarsProps {
  contributors: Contributor[]
}

export function ClientAvatars({ contributors }: ClientAvatarsProps) {
  const [avatars, setAvatars] = useState<Record<string, string>>({})
  const avatarCache = useRef<Map<string, string>>(new Map())

  const fetchCachedAvatar = async (clientId: string) => {
    if (avatarCache.current.has(clientId)) {
      return avatarCache.current.get(clientId)!
    }

    const url = await fetchAvatar(clientId)
    avatarCache.current.set(clientId, url)
    return url
  }

  useEffect(() => {
    if (!contributors?.length) return

    const loadAvatars = async () => {
      try {
        const results = await Promise.all(
          contributors
            .filter(c => c.client.id)
            .map(async ({ client }) => {
              const avatarUrl = await fetchCachedAvatar(client.id!)
              return [client.id!, avatarUrl] as const
            })
        )

        setAvatars(Object.fromEntries(results))
      } catch (err) {
        console.error("Error loading client avatars", err)
      }
    }

    loadAvatars()
  }, [contributors])

  if (!contributors?.length) return null

  return (
    <TooltipProvider>
      <div className="pt-2 flex -space-x-2">
        {contributors.map(({ client }) => {
          if (!client.id) return null

          const avatarUrl = avatars[client.id]
          const fallback =
            client.firstName?.[0] ??
            client.companyName?.[0] ??
            "?"

          const label = client.firstName
            ? `${client.firstName} ${client.lastName}`
            : client.companyName

          return (
            <Tooltip key={client.id}>
              <TooltipTrigger asChild>
                <Avatar
                  className="h-8 w-8 ring-2 ring-background grayscale hover:grayscale-0 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="text-[10px]">
                    {fallback}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>

              <TooltipContent>
                <p className="text-xs">{label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}