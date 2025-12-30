"use client"

import { useCallback, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, migrateFromLocalStorageIfNeeded, newId, type ShoppingListRecord } from "@/lib/db"

export interface ListItem {
  id: string
  name: string
  completed: boolean
}

export interface ShoppingList {
  id: string
  name: string
  category: string
  items: ListItem[]
  createdAt: Date
}

export function useLists() {
  useEffect(() => {
    void migrateFromLocalStorageIfNeeded().catch((e) => {
      console.error("Failed to migrate localStorage -> Dexie:", e)
    })
  }, [])

  const lists = useLiveQuery(async () => {
    const rows = await db.lists.orderBy("createdAt").reverse().toArray()
    return rows as ShoppingListRecord[]
  }, [])

  const createList = useCallback((name: string, category: string) => {
    const id = newId()
    const newList: ShoppingListRecord = {
      id,
      name,
      category,
      items: [],
      createdAt: new Date(),
    }
    void db.lists.put(newList).catch((e) => {
      console.error("Failed to create list:", e)
    })
    return id
  }, [])

  const deleteList = useCallback((id: string) => {
    void db.lists.delete(id).catch((e) => {
      console.error("Failed to delete list:", e)
    })
  }, [])

  const addItemToList = useCallback((listId: string, itemName: string) => {
    void (async () => {
      const list = await db.lists.get(listId)
      if (!list) return
      const next = {
        ...list,
        items: [
          ...(list.items ?? []),
          {
            id: newId(),
            name: itemName,
            completed: false,
          },
        ],
      }
      await db.lists.put(next)
    })().catch((e) => {
      console.error("Failed to add item:", e)
    })
  }, [])

  const toggleItemComplete = useCallback((listId: string, itemId: string) => {
    void (async () => {
      const list = await db.lists.get(listId)
      if (!list) return
      const next = {
        ...list,
        items: (list.items ?? []).map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
      }
      await db.lists.put(next)
    })().catch((e) => {
      console.error("Failed to toggle item:", e)
    })
  }, [])

  const deleteItem = useCallback((listId: string, itemId: string) => {
    void (async () => {
      const list = await db.lists.get(listId)
      if (!list) return
      const next = {
        ...list,
        items: (list.items ?? []).filter((item) => item.id !== itemId),
      }
      await db.lists.put(next)
    })().catch((e) => {
      console.error("Failed to delete item:", e)
    })
  }, [])

  const updateItemName = useCallback((listId: string, itemId: string, newName: string) => {
    void (async () => {
      const list = await db.lists.get(listId)
      if (!list) return
      const next = {
        ...list,
        items: (list.items ?? []).map((item) => (item.id === itemId ? { ...item, name: newName } : item)),
      }
      await db.lists.put(next)
    })().catch((e) => {
      console.error("Failed to update item name:", e)
    })
  }, [])

  const uncheckAllItems = useCallback((listId: string) => {
    void (async () => {
      const list = await db.lists.get(listId)
      if (!list) return

      const items = list.items ?? []
      if (items.length === 0) return

      const nextItems = items.map((item) => (item.completed ? { ...item, completed: false } : item))
      await db.lists.put({ ...list, items: nextItems })
    })().catch((e) => {
      console.error("Failed to uncheck all items:", e)
    })
  }, [])

  return {
    lists: (lists ?? []).map((list) => ({
      ...list,
      createdAt: list.createdAt instanceof Date ? list.createdAt : new Date(list.createdAt),
    })),
    createList,
    deleteList,
    addItemToList,
    toggleItemComplete,
    deleteItem,
    updateItemName,
    uncheckAllItems,
  }
}
