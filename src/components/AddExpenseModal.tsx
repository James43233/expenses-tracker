"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import type { Expense } from "../hooks/useExpenses"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expenses: Omit<Expense, "id">[]) => void
  defaultDate: Date
}

interface ExpenseInput {
  description: string
  amount: string
}

export default function AddExpenseModal({ isOpen, onClose, onAdd, defaultDate }: AddExpenseModalProps) {
  const [expenseInputs, setExpenseInputs] = useState<ExpenseInput[]>([{ description: "", amount: "" }])
  const [selectedExpenseDate, setSelectedExpenseDate] = useState<Date>(defaultDate)

  useEffect(() => {
    if (isOpen) {
      setSelectedExpenseDate(defaultDate)
    }
  }, [defaultDate, isOpen])

  const selectedExpenseDateLabel = useMemo(() => {
    return selectedExpenseDate ? format(selectedExpenseDate, "PPP") : "Pick a date"
  }, [selectedExpenseDate])

  const handleAddField = () => {
    setExpenseInputs([...expenseInputs, { description: "", amount: "" }])
  }

  const handleRemoveField = (index: number) => {
    if (expenseInputs.length > 1) {
      setExpenseInputs(expenseInputs.filter((_, i) => i !== index))
    }
  }

  const handleInputChange = (index: number, field: "description" | "amount", value: string) => {
    const updated = [...expenseInputs]
    updated[index][field] = value
    setExpenseInputs(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const now = new Date()
    const dateWithTime = new Date(selectedExpenseDate)
    dateWithTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())

    const validExpenses = expenseInputs
      .filter((exp) => exp.description.trim() && exp.amount.trim())
      .map((exp) => ({
        description: exp.description.trim(),
        amount: Number.parseFloat(exp.amount),
        date: dateWithTime,
      }))
      .filter((exp) => !isNaN(exp.amount) && exp.amount > 0)

    if (validExpenses.length > 0) {
      onAdd(validExpenses)
      setExpenseInputs([{ description: "", amount: "" }])
      onClose()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setExpenseInputs([{ description: "", amount: "" }])
      setSelectedExpenseDate(defaultDate)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Expenses</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Expense Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  {selectedExpenseDateLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedExpenseDate}
                  onSelect={(date) => date && setSelectedExpenseDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {expenseInputs.map((input, index) => (
              <div key={index} className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor={`desc-${index}`} className="text-sm">
                    Description
                  </Label>
                  <textarea
                    id={`desc-${index}`}
                    placeholder="Ex. Groceries, Transport"
                    value={input.description}
                    rows={4}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none resize-y focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`amount-${index}`} className="text-sm">
                      Amount (₱)
                    </Label>
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      placeholder="500"
                      step="0.01"
                      min="0"
                      value={input.amount}
                      onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                    />
                  </div>
                  {expenseInputs.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {index < expenseInputs.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          <Button type="button" onClick={handleAddField} variant="outline" className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Another
          </Button>
        </form>

        <DialogFooter className="flex gap-2">
          <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
