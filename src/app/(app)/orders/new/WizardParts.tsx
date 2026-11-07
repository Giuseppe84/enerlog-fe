"use client";
import { useMemo, useState, type ReactNode } from "react"
import { Check, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ---------- Stepper ----------

export function WizardSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Avanzamento">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "border-2 border-primary text-primary"
                  : "border text-muted-foreground"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`hidden text-sm sm:block ${active ? "font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}

export function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  const d = data as any
  for (const key of ["data", "items", "results", "rows"]) {
    if (Array.isArray(d?.[key])) return d[key] as T[]
  }
  return []
}


// ---------- Lista selezionabile con ricerca ----------

export function PickList<T>({
  items,
  loading,
  selectedId,
  getId,
  getLabel,
  getSubtitle,
  onSelect,
  placeholder = "Cerca...",
  empty = "Nessun risultato.",
}: {
  items: T[]
  loading?: boolean
  selectedId?: string | null
  getId: (item: T) => string
  getLabel: (item: T) => string
  getSubtitle?: (item: T) => string | undefined
  onSelect: (item: T) => void
  placeholder?: string
  empty?: string
}) {
  const [query, setQuery] = useState("")

const filtered = useMemo(() => {
  const list = Array.isArray(items) ? items : []
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter((item) =>
    `${getLabel(item)} ${getSubtitle?.(item) ?? ""}`.toLowerCase().includes(q)
  )
}, [items, query, getLabel, getSubtitle])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Caricamento...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          filtered.map((item) => {
            const id = getId(item)
            const selected = id === selectedId
            const subtitle = getSubtitle?.(item)
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(item)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{getLabel(item)}</span>
                  {subtitle && (
                    <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
                  )}
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ---------- Selettore "esistente / nuovo" ----------

export function ModeToggle({
  value,
  onChange,
  existingLabel = "Seleziona esistente",
  newLabel = "Crea nuovo",
}: {
  value: "select" | "create"
  onChange: (v: "select" | "create") => void
  existingLabel?: string
  newLabel?: string
}) {
  const base = "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
  return (
    <div className="flex rounded-lg bg-muted p-1" role="group">
      <button
        type="button"
        className={`${base} ${value === "select" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        onClick={() => onChange("select")}
      >
        {existingLabel}
      </button>
      <button
        type="button"
        className={`${base} ${value === "create" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        onClick={() => onChange("create")}
      >
        {newLabel}
      </button>
    </div>
  )
}

// ---------- Campo di form ----------

export function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string
  htmlFor: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

// ---------- Helper di visualizzazione ----------

export const personLabel = (p?: {
  firstName?: string | null
  lastName?: string | null
  companyName?: string | null
} | null) =>
  p?.companyName?.trim() ||
  `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim() ||
  "Senza nome"

export const formatEuro = (value: number | string | null | undefined) =>
  `€ ${Number(value || 0).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
