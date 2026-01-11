"use client"

import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useLists } from "@/hooks/useList"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Plus, ShoppingCart, Trash2, X, List } from "lucide-react"

const CATEGORIES = ["Grocery", "Public Market", "Personal", "Household", "Other"]

function Lists() {
  const { lists, createList, deleteList, addItemToList, toggleItemComplete, deleteItem, uncheckAllItems } = useLists()
  const [newListName, setNewListName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0])
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewListId, setViewListId] = useState<string | null>(null)
  const [viewItemInput, setViewItemInput] = useState("")

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName, selectedCategory)
      setNewListName("")
    }
  }

  const selectedList = useMemo(() => {
    if (!viewListId) return null
    return lists.find((l) => l.id === viewListId) ?? null
  }, [lists, viewListId])

  const openView = (listId: string) => {
    setViewListId(listId)
    setViewItemInput("")
    setIsViewOpen(true)
  }

  const handleAddItemInView = () => {
    if (!viewListId) return
    const itemName = viewItemInput.trim()
    if (!itemName) return
    addItemToList(viewListId, itemName)
    setViewItemInput("")
  }

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto mt-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ">
        <Dialog>
          <DialogTrigger asChild>
            <Button className=" gap-2" size="md" variant="secondary">
              <List /> Create New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="list-name">List Name</Label>
                <Input
                  id="list-name"
                  placeholder="e.g., Weekly Groceries"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateList()}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreateList} className="w-full">
                Create List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="pt-16 pb-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No lists yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
          {lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => openView(list.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openView(list.id)
                }
              }}
              className="w-full text-left"
              aria-label={`Open list ${list.name}`}
            >
              <Card className="shadow-sm rounded-2xl transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg min-w-0 wrap-break-word overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                    {list.name}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">{list.category}</div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">List:</div>
                  {list.items.length === 0 ? (
                    <div className="mt-1 text-sm text-muted-foreground">No items yet</div>
                  ) : (
                    <div className="mt-1 space-y-1">
                      {list.items.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {item.name}
                        </div>
                      ))}
                      {list.items.length > 2 && (
                        <div className="text-sm text-muted-foreground">+{list.items.length - 2} more</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open)
          if (!open) {
            setViewListId(null)
            setViewItemInput("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedList?.name ?? "List"}</DialogTitle>
            {selectedList?.category ? <div className="text-sm text-muted-foreground">{selectedList.category}</div> : null}
          </DialogHeader>

          {!selectedList ? (
            <div className="text-sm text-muted-foreground">List not found.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">{selectedList.items.length} items</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => uncheckAllItems(selectedList.id)}
                  disabled={selectedList.items.length === 0}
                >
                  Reset checks
                </Button>
              </div>

              <Separator />

              {selectedList.items.length === 0 ? (
                <div className="text-sm text-muted-foreground">No items yet. Add one below.</div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedList.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox checked={item.completed} onCheckedChange={() => toggleItemComplete(selectedList.id, item.id)} />
                      <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.name}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteItem(selectedList.id, item.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label="Delete item"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Input
                  placeholder="Add item..."
                  value={viewItemInput}
                  onChange={(e) => setViewItemInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddItemInView()
                    }
                  }}
                />
                <Button onClick={handleAddItemInView} className="gap-2" disabled={!viewItemInput.trim()}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              {selectedList ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteList(selectedList.id)
                    setIsViewOpen(false)
                  }}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete list
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Route = createFileRoute("/List")({
  component: Lists,
})
