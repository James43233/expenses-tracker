"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Expense } from "../hooks/useExpenses"
import { Pencil } from "lucide-react"

interface ExpenseListProps {
  expenses: Expense[]
  onViewMore: (expenseId: string) => void
}

export default function ExpenseList({ expenses, onViewMore }: ExpenseListProps) {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No expenses found. Add one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4 shadow-sm rounded-2xl">
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedExpenses.map((expense) => (
            <div key={expense.id} className="p-4 sm:p-5">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
                <div className="min-w-0">
                  <div className="font-medium leading-5">{format(new Date(expense.date), "MMM d, yyyy")}</div>
                  <div className="text-xs text-muted-foreground leading-4">{format(new Date(expense.date), "h:mm a")}</div>
                </div>

                <div className="text-right font-bold text-primary whitespace-nowrap">₱{expense.amount.toFixed(2)}</div>

                <Button onClick={() => onViewMore(expense.id)} variant="outline" size="xs" aria-label="Edit expense">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 text-sm text-foreground whitespace-normal wrap-break-word">
                {expense.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
