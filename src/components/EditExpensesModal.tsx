import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Expense } from "@/hooks/useExpenses"
import { Trash2 } from "lucide-react"

type Draft = {
  description: string
  amount: string
  date: Date
}

function toLocalDraft(expense: Expense): Draft {
  return {
    description: expense.description,
    amount: String(expense.amount),
    date: expense.date instanceof Date ? expense.date : new Date(expense.date),
  }
}

function withSameTime(original: Date, nextDay: Date): Date {
  const result = new Date(nextDay)
  result.setHours(original.getHours(), original.getMinutes(), original.getSeconds(), original.getMilliseconds())
  return result
}

export default function EditExpensesModal({
  isOpen,
  onClose,
  expenses,
  onUpdate,
  onDelete,
}: {
  isOpen: boolean
  onClose: () => void
  expenses: Expense[]
  onUpdate: (id: string, updates: { description: string; amount: number; date: Date }) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
}) {
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses])

  const [drafts, setDrafts] = useState<Record<string, Draft>>({})

  useEffect(() => {
    if (!isOpen) return
    const next: Record<string, Draft> = {}
    for (const expense of sortedExpenses) {
      next[expense.id] = toLocalDraft(expense)
    }
    setDrafts(next)
  }, [isOpen, sortedExpenses])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl">
        <DialogHeader>
          <DialogTitle>View more</DialogTitle>
          <DialogDescription>Edit description, amount, and date.</DialogDescription>
        </DialogHeader>

        {sortedExpenses.length === 0 ? (
          <div className="text-sm text-muted-foreground">No expenses to edit for the current filter.</div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
            {sortedExpenses.map((expense) => {
              const draft = drafts[expense.id]
              if (!draft) return null

              return (
                <div key={expense.id} className="rounded-md border border-border p-3 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor={`desc-${expense.id}`}>Description</Label>
                      <textarea
                        id={`desc-${expense.id}`}
                        value={draft.description}
                        rows={4}
                        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none resize-y focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [expense.id]: { ...prev[expense.id], description: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`amt-${expense.id}`}>Amount</Label>
                      <Input
                        id={`amt-${expense.id}`}
                        inputMode="decimal"
                        value={draft.amount}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [expense.id]: { ...prev[expense.id], amount: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                            {draft.date ? format(draft.date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={draft.date}
                            onSelect={(date) => {
                              if (!date) return
                              setDrafts((prev) => ({
                                ...prev,
                                [expense.id]: {
                                  ...prev[expense.id],
                                  date: withSameTime(new Date(expense.date), date),
                                },
                              }))
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="sm:col-span-2 flex sm:justify-end">
                      <div className="w-full sm:w-auto flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-end">
                        <Button
                          variant="destructive"
                          className="w-full sm:w-auto"
                          onClick={async () => {
                            await onDelete(expense.id)
                            onClose()
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          size = "lg"
                          onClick={async () => {
                            const description = draft.description.trim()
                            const amount = Number(draft.amount)
                            if (!description) return
                            if (!Number.isFinite(amount) || amount <= 0) return
                            await onUpdate(expense.id, { description, amount, date: draft.date })
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
