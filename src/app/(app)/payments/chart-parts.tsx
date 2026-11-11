"use client"

import type { ReactNode } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// ---------------------------------------------------------------------------
// Periodo
// ---------------------------------------------------------------------------

export type PeriodKey = "3M" | "6M" | "1Y" | "5Y"

export const PERIODS: { key: PeriodKey; label: string; months: number; description: string }[] = [
  { key: "3M", label: "3 mesi", months: 3, description: "ultimi 3 mesi" },
  { key: "6M", label: "6 mesi", months: 6, description: "ultimi 6 mesi" },
  { key: "1Y", label: "1 anno", months: 12, description: "ultimo anno" },
  { key: "5Y", label: "5 anni", months: 60, description: "ultimi 5 anni" },
]

export const periodStart = (months: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

export function PeriodSelector({
  value,
  onChange,
}: {
  value: PeriodKey
  onChange: (key: PeriodKey) => void
}) {
  return (
    <div role="group" aria-label="Periodo" className="inline-flex rounded-lg border p-0.5">
      {PERIODS.map((p) => (
        <Button
          key={p.key}
          type="button"
          size="sm"
          variant={value === p.key ? "default" : "ghost"}
          aria-pressed={value === p.key}
          onClick={() => onChange(p.key)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Indicatore (KPI)
// ---------------------------------------------------------------------------

export function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Grafico radiale (shadcn/ui chart + Recharts)
// ---------------------------------------------------------------------------

/** Anello con segmenti impilati, valore al centro e ChartTooltip. */
export function RadialSummaryChart({
  config,
  values,
  keys,
  centerValue,
  centerLabel,
  formatValue = (v) => String(v),
}: {
  config: ChartConfig
  values: Record<string, number>
  keys: string[]
  centerValue: string
  centerLabel: string
  formatValue?: (value: number) => string
}) {
  const total = keys.reduce((acc, k) => acc + (values[k] || 0), 0)

  if (total <= 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
        Nessun dato nel periodo
      </div>
    )
  }

  return (
    <ChartContainer config={config} className="mx-auto h-44 w-44">
      <RadialBarChart data={[values]} startAngle={90} endAngle={-270} innerRadius={62} outerRadius={84}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: `var(--color-${String(name)})` }}
                    />
                    {config[String(name)]?.label}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatValue(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 4} className="fill-foreground text-2xl font-bold">
                      {centerValue}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-xs">
                      {centerLabel}
                    </tspan>
                  </text>
                )
              }
              return null
            }}
          />
        </PolarRadiusAxis>
        {keys.map((k) => (
          <RadialBar
            key={k}
            dataKey={k}
            stackId="a"
            cornerRadius={4}
            fill={`var(--color-${k})`}
            className="stroke-transparent stroke-2"
          />
        ))}
      </RadialBarChart>
    </ChartContainer>
  )
}

export interface TrendRow {
  label: string
  dot: string // classe Tailwind bg-*
  value: string
  hint?: string
  onClick: () => void
}

/** Card con grafico, riepilogo e righe-link che aprono l'elenco dei pagamenti di riferimento. */
export function TrendCard({
  title,
  description,
  chart,
  summary,
  rows,
}: {
  title: string
  description: string
  chart: ReactNode
  summary: string
  rows: TrendRow[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {chart}
        <p className="text-center text-sm text-muted-foreground">{summary}</p>
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={row.onClick}
              className="group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.dot}`} />
                <span className="font-medium">{row.label}</span>
                {row.hint && <span className="truncate text-xs text-muted-foreground">{row.hint}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1 font-semibold">
                {row.value}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Modale con elenco
// ---------------------------------------------------------------------------

export function ListModal({
  open,
  onOpenChange,
  title,
  description,
  empty,
  isEmpty,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  empty: string
  isEmpty: boolean
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {isEmpty ? (
          <p className="py-8 text-center text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-3 pt-2">{children}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
