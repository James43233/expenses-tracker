
import { useCallback, useEffect, useMemo, useState } from "react"
import { startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { useLiveQuery } from "dexie-react-hooks"
import { db, migrateFromLocalStorageIfNeeded, newId, type ExpenseRecord } from "@/lib/db"

export interface Expense {
  id: string
  description: string
  amount: number
  date: Date
}

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

type ExpenseUpdate = Partial<Pick<Expense, "description" | "amount" | "date">>

export function useExpenses() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })

  useEffect(() => {
    void migrateFromLocalStorageIfNeeded().catch((e) => {
      console.error("Failed to migrate localStorage -> Dexie:", e)
    })
  }, [])

  const expenses = useLiveQuery(async () => {
    const rows = await db.expenses.orderBy("date").reverse().toArray()
    return rows as ExpenseRecord[]
  }, [])

  const safeExpenses: Expense[] = useMemo(() => {
    return (expenses ?? []).map((exp) => ({
      ...exp,
      date: exp.date instanceof Date ? exp.date : new Date(exp.date),
    }))
  }, [expenses])

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    const record: ExpenseRecord = {
      ...expense,
      id: newId(),
      date: expense.date instanceof Date ? expense.date : new Date(expense.date),
    }
    void db.expenses.put(record).catch((e) => {
      console.error("Failed to add expense:", e)
    })
  }, [])

  const addMultipleExpenses = useCallback((newExpenses: Omit<Expense, "id">[]) => {
    const records: ExpenseRecord[] = newExpenses.map((exp) => ({
      ...exp,
      id: newId(),
      date: exp.date instanceof Date ? exp.date : new Date(exp.date),
    }))
    void db.transaction("rw", db.expenses, async () => {
      await db.expenses.bulkPut(records)
    }).catch((e) => {
      console.error("Failed to add multiple expenses:", e)
    })
  }, [])

  const deleteExpense = useCallback((id: string) => {
    void db.expenses.delete(id).catch((e) => {
      console.error("Failed to delete expense:", e)
    })
  }, [])

  const updateExpense = useCallback(async (id: string, updates: ExpenseUpdate) => {
    const next: Partial<ExpenseRecord> = {}

    if (updates.description !== undefined) {
      const description = String(updates.description).trim()
      if (!description) return
      next.description = description
    }

    if (updates.amount !== undefined) {
      const amount = Number(updates.amount)
      if (!Number.isFinite(amount) || amount <= 0) return
      next.amount = amount
    }

    if (updates.date !== undefined) {
      const date = updates.date instanceof Date ? updates.date : new Date(updates.date)
      if (isNaN(date.getTime())) return
      next.date = date
    }

    if (Object.keys(next).length === 0) return

    try {
      await db.expenses.update(id, next)
    } catch (e) {
      console.error("Failed to update expense:", e)
    }
  }, [])

  const getExpensesForDay = useCallback(
    (date: Date) => {
      return safeExpenses.filter((exp) => {
        const expDate = new Date(exp.date)
        return isWithinInterval(expDate, {
          start: startOfDay(date),
          end: endOfDay(date),
        })
      })
    },
    [safeExpenses],
  )

  const getExpensesForMonth = useCallback(
    (date: Date) => {
      return safeExpenses.filter((exp) => {
        const expDate = new Date(exp.date)
        return isWithinInterval(expDate, {
          start: startOfMonth(date),
          end: endOfMonth(date),
        })
      })
    },
    [safeExpenses],
  )

  const getExpensesForRange = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      if (!from || !to) return []
      return safeExpenses.filter((exp) => {
        const expDate = new Date(exp.date)
        return isWithinInterval(expDate, {
          start: startOfDay(from),
          end: endOfDay(to),
        })
      })
    },
    [safeExpenses],
  )

  const getDayTotal = useCallback(
    (date: Date) => {
      return getExpensesForDay(date).reduce((sum, exp) => sum + exp.amount, 0)
    },
    [getExpensesForDay],
  )

  const getMonthTotal = useCallback(
    (date: Date) => {
      return getExpensesForMonth(date).reduce((sum, exp) => sum + exp.amount, 0)
    },
    [getExpensesForMonth],
  )

  const getRangeTotal = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      return getExpensesForRange(from, to).reduce((sum, exp) => sum + exp.amount, 0)
    },
    [getExpensesForRange],
  )

  return {
    expenses: safeExpenses,
    selectedDate,
    setSelectedDate,
    dateRange,
    setDateRange,
    addExpense,
    addMultipleExpenses,
    deleteExpense,
    updateExpense,
    getExpensesForDay,
    getExpensesForMonth,
    getExpensesForRange,
    getDayTotal,
    getMonthTotal,
    getRangeTotal,
  }
}
