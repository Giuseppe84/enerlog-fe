import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, FileText, Building2, MapPin } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchAvatar } from "@/api/clients"
import { useEffect, useRef, useState } from "react"

export type OrderCardProps = {
  order: {
    id: string;
    code: string;
    status: 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

    practices?: string[];
    ctPractices?: string[];
    fvPractices?: string[];

    payments?: string[];
    invoices?: string[];

    totalAmount: string;
    paidAmount: string;

    clientId: string;
    client?: {
      id: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
    };

    createdAt: string;
    updatedAt: string;
  };
};

const statusColor: Record<OrderCardProps['order']['status'], string> = {
  DRAFT: 'bg-gray-200 text-gray-800',
  PENDING: 'bg-yellow-200 text-yellow-900',
  IN_PROGRESS: 'bg-blue-200 text-blue-900',
  COMPLETED: 'bg-green-200 text-green-900',
  CANCELLED: 'bg-red-200 text-red-900',
};

export default function OrderCard({ order }: OrderCardProps) {
  const total = Number(order.totalAmount);
  const paid = Number(order.paidAmount);
  const remaining = total - paid;
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>()
  const [clientName, setClientName] = useState<string>()
  const avatarCache = useRef<Map<string, string>>(new Map())

  const fallback =
    order.client?.companyName?.[0] ??
    order.client?.firstName?.[0] ??
    "?"


  useEffect(() => {
    console.log(order)
    if (!order.client || order.client === undefined) return

    const loadAvatar = async () => {

      if (avatarCache.current.has(order.client.id)) {
        setAvatarUrl(avatarCache.current.get(order.client.id))
        return
      }

      const url = await fetchAvatar(order.client.id)
      if (!url) return;
      avatarCache.current.set(order.client.id, url)
      setAvatarUrl(url)
    }
    
    const _clientName= order.client?.companyName?
         order.client.companyName
        : [order.client?.firstName, order.client?.lastName].filter(Boolean).join(" ")

setClientName(_clientName)
    loadAvatar()
  }, [order.client])

  return (
    <TableRow onClick={() => router.push("/orders/" + order.id)}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <p className="text-accent font-bold">Ordine #{order.code}</p>
        </div>
      </TableCell>
      <TableCell>
        <span>{clientName}</span>
      </TableCell>
      <TableCell>
        <Badge className={cn('rounded-full px-3 py-1 text-xs', statusColor[order.status])}>
          {order.status}
        </Badge>
      </TableCell>

      <TableCell>
        <p className="font-semibold">€ {total.toFixed(2)}</p>
      </TableCell>
      <TableCell>


        <p className={cn('font-semibold', remaining > 0 ? 'text-red-600' : 'text-green-600')}>
          € {remaining.toFixed(2)}
        </p>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString()}
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
              onClick={() => navigator.clipboard.writeText(order.id)}
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

  );
}
