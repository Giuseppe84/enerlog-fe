import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { ArrowUpRightIcon } from "lucide-react"
export function EmptyServices(onClick: { onClick: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
    
        </EmptyMedia>
        <EmptyTitle>No Services Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any services yet. Get started by creating
          your first service.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button onClick={onClick.onClick}>Create Service</Button>
        <Button variant="outline">Import Service</Button>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="#">
          Learn More <ArrowUpRightIcon />
        </a>
      </Button>
    </Empty>
  )
}
