"use client"

import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useBudget } from "../hooks/useBudget"
import { useExpenses } from "../hooks/useExpenses"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, TrendingDown } from "lucide-react"

const BUDGET_CATEGORIES = ["Personal", "Grocery", "Public Market", "Household", "Entertainment"]

export const Route = createFileRoute("/Budget")({
  component: Budget,
})

function Budget() {
  const { budgets, setBudget, deleteBudget, getPercentage } = useBudget()
  const { expenses } = useExpenses()
  const [newCategory, setNewCategory] = useState(BUDGET_CATEGORIES[0])
  const [newAmount, setNewAmount] = useState("")

  const calculateCategorySpent = (category: string) => {
    return expenses
      .filter((exp) => exp.description.toLowerCase().includes(category.toLowerCase()))
      .reduce((sum, exp) => sum + exp.amount, 0)
  }

  const handleAddBudget = () => {
    const amount = Number.parseFloat(newAmount)
    if (!isNaN(amount) && amount > 0) {
      setBudget(newCategory, amount)
      setNewAmount("")
    }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0)
  const totalOverBudget = budgets.reduce((sum, b) => {
    const spent = calculateCategorySpent(b.category)
    return sum + Math.max(0, spent - b.budgetAmount)
  }, 0)

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto mt-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-linear-to-r from-primary to-primary/80 rounded-xl p-3 text-primary-foreground shadow-lg">
        <div className="p-3">
          <h2 className="text-3xl font-bold text-primary-foreground">Budget Management</h2>
          <p className="text-primary-foreground/90 mt-1">Set and track your spending budgets</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="budget-category">Category</Label>
                <select
                  id="budget-category"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="budget-amount">Budget Amount (₱)</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  placeholder="5000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddBudget()}
                />
              </div>
              <Button onClick={handleAddBudget} className="w-full">
                Set Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₱{totalBudget.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₱{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Over Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalOverBudget > 0 ? "text-destructive" : "text-primary"}`}>
              ₱{totalOverBudget.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="pt-16 pb-16 text-center">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No budgets set yet. Create one to start tracking!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const spent = calculateCategorySpent(budget.category)
            const percentage = getPercentage(budget.budgetAmount, spent)
            const isOver = spent > budget.budgetAmount

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        ₱{spent.toLocaleString("en-PH", { minimumFractionDigits: 2 })} / ₱
                        {budget.budgetAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBudget(budget.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={`font-semibold ${isOver ? "text-destructive" : "text-primary"}`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentage < 75 ? "bg-primary" : percentage < 100 ? "bg-secondary" : "bg-destructive"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    {isOver && (
                      <p className="text-sm text-destructive font-semibold">
                        Over by ₱{(spent - budget.budgetAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
