
import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/hooks/useExpenses"
import ExpenseSummary from "@/components/ExpenseSummary"
import ExpenseList from "@/components/ExpenseList"
import CalendarFilter from "@/components/CalendarFilter"
import AddExpenseModal from "@/components/AddExpenseModal"
import type { DateRange } from "react-day-picker"

export const Route = createFileRoute("/")({
  component: Dashboard,
})

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [useRange, setUseRange] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const {
    selectedDate,
    setSelectedDate,
    addMultipleExpenses,
    deleteExpense,
    getExpensesForDay,
    getDayTotal,
    getExpensesForRange,
    getRangeTotal,
  } = useExpenses()

  const filteredExpenses = useMemo(() => {
    if (useRange) {
      return getExpensesForRange(dateRange.from, dateRange.to)
    }
    return selectedDate ? getExpensesForDay(selectedDate) : []
  }, [dateRange.from, dateRange.to, getExpensesForDay, getExpensesForRange, selectedDate, useRange])

  const filteredTotal = useMemo(() => {
    if (useRange) {
      return getRangeTotal(dateRange.from, dateRange.to)
    }
    return selectedDate ? getDayTotal(selectedDate) : 0
  }, [dateRange.from, dateRange.to, getDayTotal, getRangeTotal, selectedDate, useRange])

  const summaryLabel = useRange ? "Range Total" : "Day Total"

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto mt-4">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary to-primary/80 rounded-xl p-3 text-primary-foreground shadow-lg">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Manage Your Expenses</h2>
        <p className="text-primary-foreground/90">Track and organize your spending with ease</p>
      </div>

      {/* One line: Calendar card (full width) + Add button */}
      <div className="flex flex-row gap-4 items-start w-full">
        <div className="flex-1 min-w-0">
          <CalendarFilter
            selectedDate={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date)
              setUseRange(false)
              setDateRange({ from: undefined, to: undefined })
            }}
            useRange={useRange}
            onUseRangeChange={setUseRange}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            selectedCount={selectedDate ? getExpensesForDay(selectedDate).length : 0}
            rangeCount={dateRange.from && dateRange.to ? getExpensesForRange(dateRange.from, dateRange.to).length : 0}
          />
          <Button onClick={() => setIsModalOpen(true)} size="lg" className="shrink-0 whitespace-nowrap w-full mt-4">
            <Plus className="h-5 w-5 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary below the calendar container */}
      {(useRange || selectedDate) && (
        <ExpenseSummary date={selectedDate || new Date()} total={filteredTotal} count={filteredExpenses.length} label={summaryLabel} />
      )}

      <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} />

      {/* Add Expense Modal */}
      {isModalOpen && (
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addMultipleExpenses}
          defaultDate={selectedDate || new Date()}
        />
      )}
    </div>
  )
}
