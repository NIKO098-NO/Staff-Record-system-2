"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Lock, Search, MessageSquare, LogOut, Eye, Users } from "lucide-react"
import { LockdownTab } from "@/components/cia/lockdown-tab"
import { InvestigationTab } from "@/components/cia/investigation-tab"
import { StaffRecordsTab } from "@/components/cia/staff-records-tab"
import { CIAChatTab } from "@/components/cia/cia-chat-tab"

interface User {
  id: string
  username: string
  role: string
  name: string
}

export default function CIADashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("lockdown")
  const [lockdownStatus, setLockdownStatus] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("ciaUser")
    if (!userData) {
      router.push("/cia-portal")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (!["CEO", "CFO", "COO", "HR", "MANAGER"].includes(parsedUser.role)) {
      router.push("/cia-portal")
      return
    }
    setUser(parsedUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("ciaUser")
    router.push("/cia-portal")
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const isExecutive = ["CEO", "CFO", "COO"].includes(user.role)
  const canAccessInvestigation = ["CEO", "CFO", "COO", "MANAGER", "HR"].includes(user.role)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-red-900 shadow-lg border-b border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/venturica-logo.png" alt="Venturica Staff Logo" className="h-8 w-8 object-contain" />
              <Shield className="h-8 w-8 text-red-200" />
              <h1 className="text-xl font-semibold text-red-100">CIA Investigation Portal</h1>
              <Badge variant="destructive" className="bg-red-700">
                {user.role}
              </Badge>
              {lockdownStatus && (
                <Badge variant="destructive" className="bg-yellow-600 text-black animate-pulse">
                  LOCKDOWN ACTIVE
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-red-200">Authorized: {user.name}</span>
              <Avatar className="h-8 w-8 border-2 border-red-400">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-red-700 text-red-100">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-400 text-red-200 hover:bg-red-800 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">System Status</CardTitle>
              <Shield className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">SECURE</div>
              <p className="text-xs text-gray-400">All systems operational</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Investigations</CardTitle>
              <Search className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">3</div>
              <p className="text-xs text-gray-400">2 pending review</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Lockdown Status</CardTitle>
              <Lock className={`h-4 w-4 ${lockdownStatus ? "text-red-400" : "text-gray-400"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lockdownStatus ? "text-red-400" : "text-gray-400"}`}>
                {lockdownStatus ? "ACTIVE" : "INACTIVE"}
              </div>
              <p className="text-xs text-gray-400">{lockdownStatus ? "Facility secured" : "Normal operations"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-700">
                {isExecutive && (
                  <TabsTrigger value="lockdown" className="flex items-center gap-2 data-[state=active]:bg-red-600">
                    <Lock className="h-4 w-4" />
                    Lockdown Control
                  </TabsTrigger>
                )}
                {canAccessInvestigation && (
                  <TabsTrigger
                    value="investigation"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                    Investigation
                  </TabsTrigger>
                )}
                <TabsTrigger value="records" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
                  <Users className="h-4 w-4" />
                  Staff Records
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                  <MessageSquare className="h-4 w-4" />
                  Secure Chat
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {isExecutive && (
                  <TabsContent value="lockdown">
                    <LockdownTab user={user} lockdownStatus={lockdownStatus} setLockdownStatus={setLockdownStatus} />
                  </TabsContent>
                )}

                {canAccessInvestigation && (
                  <TabsContent value="investigation">
                    <InvestigationTab user={user} />
                  </TabsContent>
                )}

                <TabsContent value="records">
                  <StaffRecordsTab user={user} />
                </TabsContent>

                <TabsContent value="chat">
                  <CIAChatTab user={user} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
