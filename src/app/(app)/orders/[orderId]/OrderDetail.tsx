import { Order } from "@/types/order";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderDetailProps {
  order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Ordine #{order.code}
          </h1>
          <p className="text-sm text-muted-foreground">
            Creato il {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <Badge variant="secondary">{order.status}</Badge>
      </div>

      {/* Info principali */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni ordine</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Cliente</span>
            <div className="font-medium">
              {order.client?.name ?? "—"}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground">ID Cliente</span>
            <div className="font-medium">{order.clientId}</div>
          </div>

          <div>
            <span className="text-muted-foreground">Totale</span>
            <div className="font-medium">€ {order.totalAmount}</div>
          </div>

          <div>
            <span className="text-muted-foreground">Pagato</span>
            <div className="font-medium">€ {order.paidAmount}</div>
          </div>
        </CardContent>
      </Card>

      {/* Contatori */}
      {order._count && (
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm">
            <Badge variant="outline">
              Pratiche: {order._count.practices}
            </Badge>
            <Badge variant="outline">
              CT: {order._count.ctPractices}
            </Badge>
            <Badge variant="outline">
              Pagamenti: {order._count.payments}
            </Badge>
            <Badge variant="outline">
              Fatture: {order._count.invoices}
            </Badge>
          </CardContent>
        </Card>
      )}
<Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full"> 
        <TabsTrigger value="overview">Contabile</TabsTrigger>
        <TabsTrigger value="analytics">Fatture</TabsTrigger>
        <TabsTrigger value="reports">Pratiche</TabsTrigger>
        <TabsTrigger value="settings">Pagamenti</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              View your key metrics and recent project activity. Track progress
              across all your active projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 12 active projects and 3 pending tasks.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Track performance and user engagement metrics. Monitor trends and
              identify growth opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and download your detailed reports. Export data in
              multiple formats for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 5 reports ready and available to export.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and options. Customize your
              experience to fit your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configure notifications, security, and themes.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      {/* Azioni */}
      <div className="flex gap-2">
        <Button variant="default">Modifica ordine</Button>
        <Button variant="outline">Gestisci pagamenti</Button>
        <Button variant="outline">Fatture</Button>
      </div>
    </div>
  );
}