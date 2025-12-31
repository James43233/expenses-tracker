
import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/hooks/useExpenses"
import ExpenseSummary from "@/components/ExpenseSummary"
import ExpenseList from "@/components/ExpenseList"
import CalendarFilter from "@/components/CalendarFilter"
import AddExpenseModal from "@/components/AddExpenseModal"
import EditExpensesModal from "@/components/EditExpensesModal"
import type { DateRange } from "react-day-picker"

export const Route = createFileRoute("/")({
  component: Dashboard,
})

function Dashboard() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isViewMoreOpen, setIsViewMoreOpen] = useState(false)
  const [viewMoreExpenseId, setViewMoreExpenseId] = useState<string | null>(null)
  const [useRange, setUseRange] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const {
    selectedDate,
    setSelectedDate,
    addMultipleExpenses,
    deleteExpense,
    updateExpense,
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

  const viewMoreExpenses = useMemo(() => {
    if (!viewMoreExpenseId) return []
    const found = filteredExpenses.find((e) => e.id === viewMoreExpenseId)
    return found ? [found] : []
  }, [filteredExpenses, viewMoreExpenseId])

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto mt-4">
      {/* Hero Section */}
      {(useRange || selectedDate) && (
        <ExpenseSummary date={selectedDate || new Date()} total={filteredTotal} count={filteredExpenses.length} label={summaryLabel} />
      )}
      {/* Calendar + actions (responsive) */}
      <div className="w-full">
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

        <div className="mt-4 flex">
          <Button onClick={() => setIsAddOpen(true)} size="sm" variant="secondary" className="flex items-center justify-center">
            <Plus className="h-5 w-5 " />
            Expense
          </Button>
        </div>
      </div>

      {/* Summary below the calendar container */}
      <ExpenseList
        expenses={filteredExpenses}
        onViewMore={(expenseId) => {
          setViewMoreExpenseId(expenseId)
          setIsViewMoreOpen(true)
        }}
      />

      <EditExpensesModal
        isOpen={isViewMoreOpen}
        onClose={() => {
          setIsViewMoreOpen(false)
          setViewMoreExpenseId(null)
        }}
        expenses={viewMoreExpenses}
        onUpdate={updateExpense}
        onDelete={deleteExpense}
      />

      {isAddOpen && (
        <AddExpenseModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={addMultipleExpenses}
          defaultDate={selectedDate || new Date()}
        />
      )}
    </div>
  )
}
