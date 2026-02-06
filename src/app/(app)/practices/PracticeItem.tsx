"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useEffect, useState } from 'react';

import { fetchAvatar } from "@/api/clients"
import { useRouter } from "next/navigation";
import { ClientAvatars } from "@/components/clients/clientAvatar"

import { MoreHorizontal, FileText, Building2, MapPin } from "lucide-react"



interface Practice {
  id: string
  name: string
  description: string
  status: string
  type: string
  amount: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  ctPractice: {
    practiceCode: string | null
    status: string
    incentiveAmount: string
    iban: string
  } | null
  contributors: Array<{
    role: string
    client: {
      id: string | null
      firstName: string | null
      lastName: string | null
      companyName: string | null
    }
  }>
  subject: {
    firstName: string | null
    lastName: string | null
    companyName: string | null
  }
  property: {
    address: string
    city: string
  }
  order: {
    totalAmount: string
    paidAmount: string
    status: string
  }
}


interface PracticesData {
  data: Practice[]
  meta: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
}

const typeLabels: Record<string, string> = {
  CONTO_TERMICO: "Conto Termico",
  GENERIC: "Generico",
}

export function PracticesRow({ practice }: { practice: Practice }) {

  const router = useRouter();
  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "1970-01-01T00:00:00.000Z") return "-"
    return new Date(dateString).toLocaleDateString("it-IT")
  }


  const getClientName = (client: Practice["subject"]) => {
    if (client.companyName) return client.companyName
    if (client.firstName && client.lastName) {
      return `${client.firstName} ${client.lastName}`
    }
    return "-"
  }

  
  return (
    <TableRow onClick={() => router.push("/practices/" + practice.id)}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{practice.name}</span>
          {practice.ctPractice?.practiceCode && (
            <span className="text-xs text-muted-foreground">
              {practice.ctPractice.practiceCode}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {typeLabels[practice.type] || practice.type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={statusColors[practice.status] || "bg-gray-500"}>
          {practice.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {getClientName(practice.subject)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <ClientAvatars contributors={practice.contributors} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col text-sm">
            <span>{practice.property.address}</span>
            <span className="text-xs text-muted-foreground">
              {practice.property.city}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(practice.createdAt)}
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