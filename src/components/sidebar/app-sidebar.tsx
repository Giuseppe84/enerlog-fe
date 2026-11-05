"use client"
import * as React from "react"
import {
  User,
  FileUser,
  HandPlatter,
  Receipt,
  ListCheck
} from "lucide-react"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavEntities } from "@/components/sidebar/nav-entities"
import { NavUser } from "@/components/sidebar/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
// This is sample data.
const data = {
  entities: [
    {
      name: "Clienti",
          url: "/clients",
      icon: User,
    },
    {
      name: "Soggetti",
      url: "/subjects",
      icon: FileUser,
    },
        {
      name: "Servizi",
      url: "/services",
      icon: HandPlatter,
    },
           {
      name: "Ordini",
      url: "/orders",
      icon: Receipt,
    },
               {
      name: "Pratiche",
      url: "/practices",
      icon: ListCheck,
    },
  ]
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>

      <SidebarContent>
   
        <NavEntities entities={data.entities} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
