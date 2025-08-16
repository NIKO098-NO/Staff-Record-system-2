"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, ShoppingCart, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  username: string
  role: string
  name: string
}

interface SalesTabProps {
  user: User
}

export function SalesTab({ user }: SalesTabProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const { toast } = useToast()

  // Mock sales data - now empty by default
  const [todaysSales, setTodaysSales] = useState({
    revenue: 0,
    transactions: 0,
    avgTransaction: 0,
    topProduct: "No sales yet",
    growth: 0,
  })

  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [weeklySummary, setWeeklySummary] = useState([
    { day: "Monday", revenue: 0, transactions: 0 },
    { day: "Tuesday", revenue: 0, transactions: 0 },
    { day: "Wednesday", revenue: 0, transactions: 0 },
    { day: "Thursday", revenue: 0, transactions: 0 },
    { day: "Friday", revenue: 0, transactions: 0 },
    { day: "Saturday", revenue: 0, transactions: 0 },
    { day: "Sunday", revenue: 0, transactions: 0 },
  ])

  const handleDeleteAllSales = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Sales data deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    // Reset all sales data
    setTodaysSales({
      revenue: 0,
      transactions: 0,
      avgTransaction: 0,
      topProduct: "No sales yet",
      growth: 0,
    })
    setRecentTransactions([])
    setWeeklySummary([
      { day: "Monday", revenue: 0, transactions: 0 },
      { day: "Tuesday", revenue: 0, transactions: 0 },
      { day: "Wednesday", revenue: 0, transactions: 0 },
      { day: "Thursday", revenue: 0, transactions: 0 },
      { day: "Friday", revenue: 0, transactions: 0 },
      { day: "Saturday", revenue: 0, transactions: 0 },
      { day: "Sunday", revenue: 0, transactions: 0 },
    ])

    localStorage.removeItem("salesData")
    setShowDeleteDialog(false)
    setDeleteCode("")

    toast({
      title: "All Sales Data Deleted",
      description: "All sales records have been permanently removed",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sales Dashboard</h2>
          <p className="text-gray-600">Today's sales performance and analytics</p>
        </div>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All Sales Data
        </Button>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${todaysSales.revenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+{todaysSales.growth}% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todaysSales.transactions}</div>
            <p className="text-xs text-gray-600">Total sales today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${todaysSales.avgTransaction.toFixed(2)}</div>
            <p className="text-xs text-gray-600">Per customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Product</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-600">{todaysSales.topProduct}</div>
            <p className="text-xs text-gray-600">Best seller today</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest sales activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No transactions recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{transaction.product}</p>
                      <p className="text-sm text-gray-600">{transaction.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${transaction.amount}</p>
                    <p className="text-sm text-gray-600">{transaction.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Sales performance over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklySummary.map((day) => (
              <div key={day.day} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-16 text-sm font-medium">{day.day}</div>
                  <Badge variant={day.revenue > 0 ? "default" : "secondary"}>{day.transactions} transactions</Badge>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${day.revenue > 0 ? "text-green-600" : "text-gray-400"}`}>
                    ${day.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Sales Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all sales records, transactions, and analytics data. This action cannot be
              undone.
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
            <Button type="submit" variant="destructive" onClick={handleDeleteAllSales}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
