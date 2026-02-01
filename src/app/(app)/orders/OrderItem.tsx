import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";


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
      name?: string;
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


  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition"   onClick={() => router.push("/orders/" + order.id)}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Ordine #{order.code}</h3>
            <p className="text-sm text-muted-foreground">
              Creato il {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={cn('rounded-full px-3 py-1 text-xs', statusColor[order.status])}>
            {order.status}
          </Badge>
        </div>

        {/* Cliente */}
        <div className="text-sm">
          <span className="text-muted-foreground">Cliente:</span>{' '}
          <span className="font-medium">
            {order.client?.firstName} {order.client?.lastName}
          </span>
        </div>

        {/* Importi */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Totale</p>
            <p className="font-semibold">€ {total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pagato</p>
            <p className="font-semibold text-green-600">€ {paid.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Residuo</p>
            <p className={cn('font-semibold', remaining > 0 ? 'text-red-600' : 'text-green-600')}>
              € {remaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Contatori */}


        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {order._count && order._count.practices > 0 && <span>Pratiche: {order._count.practices}</span>}
          {order._count && order._count.ctPractices > 0 && <span>Pratiche Conto Termico: {order._count.ctPractices}</span>}
          {order._count && order._count.fvPractices > 0 && <span>Pratiche fotovoltaico: {order._count.fvPractices}</span>}
          {order._count && order._count.payments > 0 && <span>Pagamenti: {order._count.payments}</span>}
          {order._count && order._count.invoices  > 0 && <span>Fatture: {order._count.invoices}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
