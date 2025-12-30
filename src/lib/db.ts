import Dexie, { type Table } from "dexie"

export interface ExpenseRecord {
  id: string
  description: string
  amount: number
  date: Date
}

export interface BudgetRecord {
  id: string
  category: string
  budgetAmount: number
  spent: number
}

export interface ListItemRecord {
  id: string
  name: string
  completed: boolean
}

export interface ShoppingListRecord {
  id: string
  name: string
  category: string
  items: ListItemRecord[]
  createdAt: Date
}

export interface MetaRecord {
  key: string
  value: unknown
}

export class ExpensesTrackerDb extends Dexie {
  expenses!: Table<ExpenseRecord, string>
  budgets!: Table<BudgetRecord, string>
  lists!: Table<ShoppingListRecord, string>
  meta!: Table<MetaRecord, string>

  constructor() {
    super("expenses-tracker")
    this.version(1).stores({
      expenses: "id, date",
      budgets: "id, &category",
      lists: "id, category, createdAt",
      meta: "&key",
    })
  }
}

export const db = new ExpensesTrackerDb()

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeExpense(raw: any): ExpenseRecord | null {
  if (!raw || typeof raw !== "object") return null
  const date = raw.date instanceof Date ? raw.date : new Date(raw.date)
  if (!(date instanceof Date) || isNaN(date.getTime())) return null
  const amount = Number(raw.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null
  const description = String(raw.description ?? "").trim()
  if (!description) return null

  return {
    id: String(raw.id ?? newId()),
    description,
    amount,
    date,
  }
}

function normalizeBudget(raw: any): BudgetRecord | null {
  if (!raw || typeof raw !== "object") return null
  const category = String(raw.category ?? "").trim()
  if (!category) return null
  const budgetAmount = Number(raw.budgetAmount)
  if (!Number.isFinite(budgetAmount) || budgetAmount < 0) return null
  const spent = Number(raw.spent)
  return {
    id: String(raw.id ?? newId()),
    category,
    budgetAmount,
    spent: Number.isFinite(spent) ? spent : 0,
  }
}

function normalizeList(raw: any): ShoppingListRecord | null {
  if (!raw || typeof raw !== "object") return null
  const name = String(raw.name ?? "").trim()
  const category = String(raw.category ?? "").trim()
  if (!name || !category) return null
  const createdAt = raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt)
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) return null
  const itemsRaw: any[] = Array.isArray(raw.items) ? raw.items : []
  const items: ListItemRecord[] = itemsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const itemName = String(item.name ?? "").trim()
      if (!itemName) return null
      return {
        id: String(item.id ?? newId()),
        name: itemName,
        completed: Boolean(item.completed),
      }
    })
    .filter(Boolean) as ListItemRecord[]

  return {
    id: String(raw.id ?? newId()),
    name,
    category,
    items,
    createdAt,
  }
}

/**
 * One-time migration to keep existing user data when moving from localStorage to IndexedDB.
 * Safe to call multiple times.
 */
export async function migrateFromLocalStorageIfNeeded(): Promise<void> {
  if (!isBrowser()) return

  const marker = await db.meta.get("migratedFromLocalStorage")
  if (marker?.value === true) return

  const rawExpenses = safeJsonParse<any[]>(localStorage.getItem("expenses"))
  const rawBudgets = safeJsonParse<any[]>(localStorage.getItem("budgets"))
  const rawLists = safeJsonParse<any[]>(localStorage.getItem("lists"))

  const expenses = (rawExpenses ?? []).map(normalizeExpense).filter(Boolean) as ExpenseRecord[]
  const budgets = (rawBudgets ?? []).map(normalizeBudget).filter(Boolean) as BudgetRecord[]
  const lists = (rawLists ?? []).map(normalizeList).filter(Boolean) as ShoppingListRecord[]

  await db.transaction("rw", db.expenses, db.budgets, db.lists, db.meta, async () => {
    if (expenses.length > 0) {
      await db.expenses.bulkPut(expenses)
    }
    if (budgets.length > 0) {
      await db.budgets.bulkPut(budgets)
    }
    if (lists.length > 0) {
      await db.lists.bulkPut(lists)
    }
    await db.meta.put({ key: "migratedFromLocalStorage", value: true })
  })
}
