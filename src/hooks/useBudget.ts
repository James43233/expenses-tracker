"use client"

import { useCallback, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, migrateFromLocalStorageIfNeeded, newId, type BudgetRecord } from "@/lib/db"

export interface BudgetItem {
  id: string
  category: string
  budgetAmount: number
  spent: number
}

export function useBudget() {
  useEffect(() => {
    void migrateFromLocalStorageIfNeeded().catch((e) => {
      console.error("Failed to migrate localStorage -> Dexie:", e)
    })
  }, [])

  const budgets = useLiveQuery(async () => {
    const rows = await db.budgets.orderBy("category").toArray()
    return rows as BudgetRecord[]
  }, [])

  const setBudget = useCallback((category: string, amount: number) => {
    void (async () => {
      const existing = await db.budgets.where("category").equals(category).first()
      if (existing) {
        await db.budgets.update(existing.id, { budgetAmount: amount })
        return
      }
      await db.budgets.put({
        id: newId(),
        category,
        budgetAmount: amount,
        spent: 0,
      })
    })().catch((e) => {
      console.error("Failed to set budget:", e)
    })
  }, [])

  const updateSpent = useCallback((category: string, amount: number) => {
    void (async () => {
      const existing = await db.budgets.where("category").equals(category).first()
      if (!existing) return
      await db.budgets.update(existing.id, { spent: amount })
    })().catch((e) => {
      console.error("Failed to update spent:", e)
    })
  }, [])

  const deleteBudget = useCallback((id: string) => {
    void db.budgets.delete(id).catch((e) => {
      console.error("Failed to delete budget:", e)
    })
  }, [])

  const getPercentage = useCallback((budgetAmount: number, spent: number) => {
    if (budgetAmount === 0) return 0
    return Math.min((spent / budgetAmount) * 100, 100)
  }, [])

  return {
    budgets: budgets ?? [],
    setBudget,
    updateSpent,
    deleteBudget,
    getPercentage,
  }
}
