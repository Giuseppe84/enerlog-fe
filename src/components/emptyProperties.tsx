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
export function EmptyProperties() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
    
        </EmptyMedia>
        <EmptyTitle>No building Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any building yet. Get started by creating
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button>Create building</Button>
        <Button variant="outline">Import building</Button>
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
