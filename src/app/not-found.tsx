// app/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="max-w-md w-full rounded-2xl shadow-md">
        <CardContent className="flex flex-col items-center text-center gap-6 py-10">
          <div className="text-7xl font-bold">404</div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Pagina non trovata</h1>
            <p className="text-sm text-muted-foreground">
              La pagina che stai cercando non esiste oppure è stata spostata.
            </p>
          </div>

          <Button asChild className="mt-4">
            <Link href="/">Torna alla dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
