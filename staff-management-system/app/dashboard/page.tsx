"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  UserIcon,
  Package,
  DollarSign,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
  LogOut,
  Settings,
  Clock,
  Shield,
  Wifi,
  WifiOff,
  Scan,
} from "lucide-react"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { InventoryTab } from "@/components/dashboard/inventory-tab"
import { SalesTab } from "@/components/dashboard/sales-tab"
import { ScheduleTab } from "@/components/dashboard/schedule-tab"
import { RequestsTab } from "@/components/dashboard/requests-tab"
import { ChatTab } from "@/components/dashboard/chat-tab"
import { AdminTab } from "@/components/dashboard/admin-tab"
import { useToast } from "@/hooks/use-toast"
import { IDScanner } from "@/components/hardware/id-scanner"

interface User {
  id: string
  username: string
  role: string
  name: string
  department?: string
  loginTime?: string
  sessionId?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [syncStatus, setSyncStatus] = useState<"connected" | "disconnected" | "syncing">("connected")
  const [lastSync, setLastSync] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  // Add scanner state
  const [showIdScanner, setShowIdScanner] = useState(false)

  // Real-time sync simulation
  useEffect(() => {
    const syncInterval = setInterval(() => {
      try {
        // Simulate real-time sync with other portal
        const currentUser = localStorage.getItem("currentUser")
        const ciaUser = localStorage.getItem("ciaUser")
        const lastSyncTime = localStorage.getItem("lastSync")

        if (currentUser && ciaUser) {
          // Cross-portal data sync
          const staffData = JSON.parse(currentUser)
          const ciaData = JSON.parse(ciaUser)

          // Update sync timestamp
          const now = new Date().toISOString()
          localStorage.setItem("lastSync", now)
          setLastSync(now)
          setSyncStatus("connected")
        } else {
          setSyncStatus("connected")
          setLastSync(new Date().toISOString())
        }
      } catch (error) {
        setSyncStatus("disconnected")
        console.error("Sync error:", error)
      }
    }, 5000) // Sync every 5 seconds

    return () => clearInterval(syncInterval)
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Check session validity (24 hour expiry)
      if (parsedUser.loginTime) {
        const loginTime = new Date(parsedUser.loginTime)
        const now = new Date()
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

        if (hoursDiff > 24) {
          toast({
            title: "Session Expired",
            description: "Please log in again for security.",
            variant: "destructive",
          })
          handleLogout()
          return
        }
      }

      // Update activity log
      const activityLog = JSON.parse(localStorage.getItem("userActivity") || "[]")
      activityLog.push({
        userId: parsedUser.id,
        action: "dashboard_access",
        timestamp: new Date().toISOString(),
        sessionId: parsedUser.sessionId,
      })
      localStorage.setItem("userActivity", JSON.stringify(activityLog.slice(-100)))
    } catch (error) {
      console.error("Session error:", error)
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    if (user) {
      // Log logout activity
      const activityLog = JSON.parse(localStorage.getItem("userActivity") || "[]")
      activityLog.push({
        userId: user.id,
        action: "logout",
        timestamp: new Date().toISOString(),
        sessionId: user.sessionId,
      })
      localStorage.setItem("userActivity", JSON.stringify(activityLog.slice(-100)))
    }

    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const openCIAPortal = () => {
    window.open("/cia-portal", "_blank")
  }

  const handleEmergencyAlert = () => {
    const alertData = {
      userId: user?.id,
      userName: user?.name,
      timestamp: new Date().toISOString(),
      type: "emergency",
      message: "Emergency alert activated from staff portal",
    }

    // Store emergency alert
    const alerts = JSON.parse(localStorage.getItem("emergencyAlerts") || "[]")
    alerts.push(alertData)
    localStorage.setItem("emergencyAlerts", JSON.stringify(alerts))

    toast({
      title: "Emergency Alert Sent",
      description: "Emergency services and management have been notified.",
      variant: "destructive",
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading secure dashboard...</p>
        </div>
      </div>
    )
  }

  const isAdmin = ["CEO", "CFO", "COO", "MANAGER", "HR"].includes(user.role)
  const isExecutive = ["CEO", "CFO", "COO"].includes(user.role)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/venturica-logo.png" alt="Venturica Staff Logo" className="h-10 w-10 object-contain" />
              <h1 className="text-xl font-semibold text-gray-900">Staff Portal</h1>
              <Badge variant={user.role === "CEO" ? "default" : "secondary"}>{user.role}</Badge>

              {/* Sync Status */}
              <div className="flex items-center space-x-1">
                {syncStatus === "connected" ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : syncStatus === "syncing" ? (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">
                  {syncStatus === "connected" ? "Synced" : syncStatus === "syncing" ? "Syncing..." : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <span className="text-xs text-gray-500">ID: {user.id}</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={openCIAPortal}>
                  <Shield className="h-4 w-4 mr-2" />
                  CIA Portal
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowIdScanner(true)}
                >
                  <Scan className="h-4 w-4 mr-2" />
                  ID Scanner
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Clock className="h-4 w-4 mr-2" />
                  Clock In/Out
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleEmergencyAlert}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Alert
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Portal Sync:</span>
                    <Badge variant={syncStatus === "connected" ? "default" : "destructive"}>{syncStatus}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Security:</span>
                    <Badge variant="default" className="bg-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Session:</span>
                    <Badge variant="secondary">Valid</Badge>
                  </div>
                  {lastSync && (
                    <p className="text-xs text-gray-500 mt-2">Last sync: {new Date(lastSync).toLocaleTimeString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <p className="font-medium text-green-800">System Online</p>
                    <p className="text-green-600">All systems operational</p>
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="font-medium text-blue-800">Data Synced</p>
                    <p className="text-blue-600">Real-time sync active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="profile" className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Sales
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Requests
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="mt-6">
                <TabsContent value="profile">
                  <ProfileTab user={user} />
                </TabsContent>

                <TabsContent value="inventory">
                  <InventoryTab user={user} />
                </TabsContent>

                <TabsContent value="sales">
                  <SalesTab user={user} />
                </TabsContent>

                <TabsContent value="schedule">
                  <ScheduleTab user={user} />
                </TabsContent>

                <TabsContent value="requests">
                  <RequestsTab user={user} />
                </TabsContent>

                <TabsContent value="chat">
                  <ChatTab user={user} />
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="admin">
                    <AdminTab user={user} />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
      {showIdScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">ID Scanner</h3>
              <Button variant="outline" onClick={() => setShowIdScanner(false)}>
                Close
              </Button>
            </div>
            <IDScanner
              onScanComplete={(result) => {
                console.log("Scan result:", result)
                // Handle scan result
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
