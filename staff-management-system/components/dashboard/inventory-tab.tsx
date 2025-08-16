"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Search, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface User {
  id: string
  username: string
  role: string
  name: string
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  lastUpdated: string
  updatedBy: string
}

interface InventoryTabProps {
  user: User
}

export function InventoryTab({ user }: InventoryTabProps) {
  const [items, setItems] = useState<InventoryItem[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    minStock: 0,
  })
  const { toast } = useToast()

  // Add delete functionality with security measures
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<"single" | "all" | null>(null)
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<string | null>(null)

  const handleDeleteItem = (itemId: string) => {
    setDeleteTarget("single")
    setSelectedItemForDelete(itemId)
    setShowDeleteDialog(true)
  }

  const handleDeleteAll = () => {
    setDeleteTarget("all")
    setSelectedItemForDelete(null)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Deletion cancelled for security.",
        variant: "destructive",
      })
      return
    }

    if (deleteTarget === "single" && selectedItemForDelete) {
      setItems(items.filter((item) => item.id !== selectedItemForDelete))
      toast({
        title: "Item Deleted",
        description: "Selected item has been permanently removed from inventory",
      })
    } else if (deleteTarget === "all") {
      setItems([])
      localStorage.removeItem("inventoryData")
      toast({
        title: "All Items Deleted",
        description: "All inventory items have been permanently removed",
        variant: "destructive",
      })
    }

    setShowDeleteDialog(false)
    setDeleteCode("")
    setDeleteTarget(null)
    setSelectedItemForDelete(null)
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      ...newItem,
      lastUpdated: new Date().toISOString().split("T")[0],
      updatedBy: user.name,
    }

    setItems([...items, item])
    setNewItem({ name: "", category: "", quantity: 0, minStock: 0 })
    setShowAddForm(false)

    toast({
      title: "Item Added",
      description: "Inventory item has been added successfully",
    })
  }

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              lastUpdated: new Date().toISOString().split("T")[0],
              updatedBy: user.name,
            }
          : item,
      ),
    )

    toast({
      title: "Quantity Updated",
      description: "Item quantity has been updated",
    })
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock) return "low"
    if (quantity <= minStock * 1.5) return "medium"
    return "good"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-600">Track and manage stock levels</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button variant="destructive" onClick={handleDeleteAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Items
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
            <CardDescription>Add a new item to the inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Enter category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock Level</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({ ...newItem, minStock: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item.quantity, item.minStock)
          return (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-center"
                        min="0"
                      />
                      <Badge
                        variant={
                          stockStatus === "low" ? "destructive" : stockStatus === "medium" ? "default" : "secondary"
                        }
                      >
                        {stockStatus === "low" ? "Low" : stockStatus === "medium" ? "Medium" : "Good"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Min Stock:</span>
                    <span>{item.minStock}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Last Updated:</span>
                    <span>{item.lastUpdated}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Updated By:</span>
                    <span>{item.updatedBy}</span>
                  </div>
                </div>

                {stockStatus === "low" && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    ⚠️ Stock level is below minimum threshold
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-2">
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Start by adding your first inventory item"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {deleteTarget === "single"
                ? "Are you sure you want to delete this item? This action cannot be undone."
                : "Are you sure you want to delete ALL items? This action cannot be undone."}
              <br />
              To confirm, enter the security code: <span className="font-bold">Con=20=delete</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Security Code
              </Label>
              <Input
                id="code"
                value={deleteCode}
                onChange={(e) => setDeleteCode(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
