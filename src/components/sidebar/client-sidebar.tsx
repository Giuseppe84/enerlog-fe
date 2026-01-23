"use client"
import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavProjects } from "@/components/sidebar/nav-projects"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import { Client } from "@/types/client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
// This is sample data.

type ClientSidebarProps =
  React.ComponentProps<typeof Sidebar> & {
    client: Client,
    setClient?: React.Dispatch<React.SetStateAction<Client>> | undefined,
  }


export function ClientSidebar({ client, setClient, ...props }: ClientSidebarProps) {
const data = {
  user: {
    name:  "nome utente",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: client.companyName ? client.companyName : `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Pratiche in corso",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Conto termico (435)",
          url: "#",
        },
        {
          title: "Fotovoltaico (231)",
          url: "#",
        },
        {
          title: "Detrazioni fiscali (124)",
          url: "#",
        },
         {
          title: "Altre pratiche (23)",
          url: "#",
        },
      ],
    },
        {
      title: "Pagamenti",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Pratiche in attesa (12)",
          url: "#",
        },
        {
          title: "Pagamenti effettuati (98)",
          url: "#",
        },
        {
          title: "Fatture (45)",
          url: "#",
        },
      ],
    },
    {
      title: "Attività",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
     {
      title: "Ricerca",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Soggetto",
          url: "subjects/",
        },
        {
          title: "Immobile",
          url: "#",
        },
        {
          title: "Pratica",
          url: "#",
        },
        {
          title: "Pagamento",
          url: "#",
        },
      ],
    }
  ],
  projects: [
    {
      name: "Dashboard",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Statistiche",
      url: "#",
      icon: Map,
    },
  ]
}


  React.useEffect(() => {
    console.log("sidebar ", client);
    // You can fetch and set real data here
  }, [])
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} client={client} setClient={setClient} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
     
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
   
    </Sidebar>
  )
}
