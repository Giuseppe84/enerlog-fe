"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Client } from "@/types/client"
import { ClientSelector } from "@/components/selectors/client-selector"

interface ClientSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectClient: (client: Client) => void
}

/** Dialog per scegliere il cliente dell'ordine. Si chiude alla selezione. */
export function ClientSelectDialog({ open, onOpenChange, onSelectClient }: ClientSelectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Seleziona cliente</DialogTitle>
          <DialogDescription>Scegli il cliente a cui intestare l&apos;ordine.</DialogDescription>
        </DialogHeader>
        <ClientSelector
          onSelectClient={(c) => {
            onSelectClient(c)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
