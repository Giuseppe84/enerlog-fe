"use client"

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { CardClient } from '@/types/client'
import { useEffect, useRef, useState } from "react"


import { fetchAvatar } from "@/api/clients"


interface ClientCardProps {
    client?: CardClient
    role?: string,
    className?: string
    onClick?: () => void
}

export function ClientCard({
    client,
    role,
    className,
    onClick,
}: ClientCardProps) {
    const isCompany = client?.type == 'LEGAL';

    const [avatarUrl, setAvatarUrl] = useState<string>()
    const avatarCache = useRef<Map<string, string>>(new Map())

    useEffect(() => {
        console.log(client)
        if (!client) return

        const loadAvatar = async () => {
            if (avatarCache.current.has(client.id)) {
                setAvatarUrl(avatarCache.current.get(client.id))
                return
            }

            const url = await fetchAvatar(client.id)
            if(!url)return;
            avatarCache.current.set(client.id, url)
            setAvatarUrl(url)
        }

        loadAvatar()
    }, [client])


    const title = isCompany
        ? client.companyName
        : [client?.firstName, client?.lastName].filter(Boolean).join(" ")

    const subtitle = client?.taxCode ?? "-"

    const fallback =
        client?.companyName?.[0] ??
        client?.firstName?.[0] ??
        "?"

    return (
        <Card
            onClick={onClick}
            className={`w-64 h-20 cursor-pointer hover:bg-muted/50 transition ${className ?? ""}`}
        >
          <CardContent className="flex h-full items-center gap-4">
                <Avatar className="h-12 w-12">
                    {avatarUrl && <AvatarImage src={avatarUrl} />}
                    <AvatarFallback>
                        {fallback}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">
                        {title || "-"}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                        {subtitle}
                    </span>
                     <span className="text-sm text-muted-foreground truncate">
                        {role}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}