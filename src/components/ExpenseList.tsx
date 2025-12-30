"use client"

import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Expense } from "../hooks/useExpenses"

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
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
    <Card className="overflow-x-auto">
      <CardContent className="pt-0 px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-1/4 text-left ">Date</TableHead>
              <TableHead className="w-1/4 text-left">Description</TableHead>
              <TableHead className="w-1/4 text-right pr-4">Amount</TableHead>
              <TableHead className="w-1/4 text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="pl-6 whitespace-nowrap">
                  <div className="font-medium">{format(new Date(expense.date), "MMM d, yyyy")}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(expense.date), "h:mm a")}</div>
                </TableCell>
                  <TableCell className="font-medium max-w-[60ch] truncate">{expense.description}</TableCell>
                  <TableCell className="text-right font-bold text-primary whitespace-nowrap pr-4">
                  ₱{expense.amount.toFixed(2)}
                </TableCell>
                  <TableCell className="pr-6 text-right">
                  <Button
                    onClick={() => onDelete(expense.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
