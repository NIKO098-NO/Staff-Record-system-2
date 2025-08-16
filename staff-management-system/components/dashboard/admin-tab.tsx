"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, AlertTriangle, Key, FileText, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdvancedFirewall } from "@/components/security/advanced-firewall"
import { IDScanner } from "@/components/hardware/id-scanner"

interface User {
  id: string
  username: string
  role: string
  name: string
}

interface StaffMember {
  id: string
  name: string
  username: string
  role: string
  email: string
  status: "active" | "suspended" | "inactive"
  warnings: number
  lastLogin: string
}

interface AdminTabProps {
  user: User
}

export function AdminTab({ user }: AdminTabProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "2002211235",
      name: "Niko",
      username: "niko20",
      role: "CEO",
      email: "niko@venturica.com",
      status: "active",
      warnings: 0,
      lastLogin: "2024-01-15",
    },
    {
      id: "9205738837",
      name: "Carlyle",
      username: "Carlyle20",
      role: "CFO",
      email: "carlyle@venturica.com",
      status: "active",
      warnings: 0,
      lastLogin: "2024-01-15",
    },
    {
      id: "7362547590",
      name: "Hanna",
      username: "Hanna20",
      role: "COO",
      email: "hanna@venturica.com",
      status: "active",
      warnings: 0,
      lastLogin: "2024-01-15",
    },
    {
      id: "STAFF12345",
      name: "John Doe",
      username: "john_doe",
      role: "STAFF",
      email: "john.doe@venturica.com",
      status: "active",
      warnings: 0,
      lastLogin: "2024-01-15",
    },
  ])

  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [showSystemReset, setShowSystemReset] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "STAFF",
    email: "",
    id: "",
  })
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [warningText, setWarningText] = useState("")
  const [resetConfirmation, setResetConfirmation] = useState("")
  const { toast } = useToast()

  // Generate random 10-digit ID
  const generateID = () => {
    const id = Math.floor(1000000000 + Math.random() * 9000000000).toString()
    setNewUser({ ...newUser, id })
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password || !newUser.email || !newUser.id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including ID number",
        variant: "destructive",
      })
      return
    }

    // Check if ID already exists
    if (staffMembers.find((s) => s.id === newUser.id)) {
      toast({
        title: "Error",
        description: "ID number already exists. Please generate a new one.",
        variant: "destructive",
      })
      return
    }

    const staffMember: StaffMember = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      role: newUser.role,
      email: newUser.email,
      status: "active",
      warnings: 0,
      lastLogin: "Never",
    }

    setStaffMembers([...staffMembers, staffMember])

    // Update localStorage for real-time sync
    const userData = JSON.parse(localStorage.getItem("systemUsers") || "[]")
    userData.push({
      ...staffMember,
      password: newUser.password,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("systemUsers", JSON.stringify(userData))

    setNewUser({ name: "", username: "", password: "", role: "STAFF", email: "", id: "" })
    setShowAddUserForm(false)

    toast({
      title: "User Added Successfully",
      description: `${newUser.name} has been added with ID: ${newUser.id}`,
    })
  }

  const handleAddWarning = () => {
    if (!selectedStaff || !warningText) {
      toast({
        title: "Error",
        description: "Please select a staff member and enter warning details",
        variant: "destructive",
      })
      return
    }

    setStaffMembers(
      staffMembers.map((staff) => (staff.id === selectedStaff ? { ...staff, warnings: staff.warnings + 1 } : staff)),
    )

    // Log warning in system
    const warnings = JSON.parse(localStorage.getItem("staffWarnings") || "[]")
    warnings.push({
      staffId: selectedStaff,
      warning: warningText,
      issuedBy: user.name,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("staffWarnings", JSON.stringify(warnings))

    setWarningText("")
    setSelectedStaff(null)

    toast({
      title: "Warning Added",
      description: "Warning has been added to staff record and synced across systems",
    })
  }

  const handleSuspendUser = (staffId: string) => {
    setStaffMembers(
      staffMembers.map((staff) =>
        staff.id === staffId ? { ...staff, status: staff.status === "suspended" ? "active" : "suspended" } : staff,
      ),
    )

    const staff = staffMembers.find((s) => s.id === staffId)

    // Log suspension action
    const actions = JSON.parse(localStorage.getItem("adminActions") || "[]")
    actions.push({
      action: staff?.status === "suspended" ? "reactivate" : "suspend",
      targetUser: staff?.name,
      targetId: staffId,
      performedBy: user.name,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("adminActions", JSON.stringify(actions))

    toast({
      title: staff?.status === "suspended" ? "User Reactivated" : "User Suspended",
      description: `${staff?.name} has been ${staff?.status === "suspended" ? "reactivated" : "suspended"}`,
    })
  }

  const handleResetPassword = (staffId: string) => {
    const newPassword = Math.random().toString(36).slice(-12) + Math.floor(Math.random() * 100)

    // Log password reset
    const actions = JSON.parse(localStorage.getItem("adminActions") || "[]")
    actions.push({
      action: "password_reset",
      targetId: staffId,
      performedBy: user.name,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("adminActions", JSON.stringify(actions))

    toast({
      title: "Password Reset Complete",
      description: `New secure password: ${newPassword} (Share securely with user)`,
    })
  }

  const handleSystemReset = () => {
    if (resetConfirmation !== "Con=20=delete") {
      toast({
        title: "Reset Cancelled",
        description: "Confirmation text does not match. System reset cancelled.",
        variant: "destructive",
      })
      return
    }

    // Clear all system data
    const keysToReset = [
      "currentUser",
      "ciaUser",
      "systemUsers",
      "staffWarnings",
      "adminActions",
      "loginHistory",
      "ciaAccessHistory",
      "userActivity",
      "emergencyAlerts",
      "lastSync",
      "ciaLastSync",
      "inventoryData",
      "salesData",
      "scheduleData",
      "requestsData",
      "chatMessages",
      "investigationData",
      "staffRecords",
    ]

    keysToReset.forEach((key) => {
      localStorage.removeItem(key)
    })

    // Reset staff members to default
    setStaffMembers([
      {
        id: "2002211235",
        name: "Niko",
        username: "niko20",
        role: "CEO",
        email: "niko@venturica.com",
        status: "active",
        warnings: 0,
        lastLogin: "Never",
      },
      {
        id: "9205738837",
        name: "Carlyle",
        username: "Carlyle20",
        role: "CFO",
        email: "carlyle@venturica.com",
        status: "active",
        warnings: 0,
        lastLogin: "Never",
      },
      {
        id: "7362547590",
        name: "Hanna",
        username: "Hanna20",
        role: "COO",
        email: "hanna@venturica.com",
        status: "active",
        warnings: 0,
        lastLogin: "Never",
      },
    ])

    setResetConfirmation("")
    setShowSystemReset(false)

    toast({
      title: "SYSTEM RESET COMPLETE",
      description: "All system data has been cleared. System restored to factory defaults.",
      variant: "destructive",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isExecutive = ["CEO", "CFO", "COO"].includes(user.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">System Administration</h2>
        <p className="text-gray-600">Manage users, security, and system operations</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="warnings">Warnings & Notes</TabsTrigger>
          <TabsTrigger value="scanner">ID Scanner</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="firewall">Advanced Firewall</TabsTrigger>
          {isExecutive && <TabsTrigger value="system">System Control</TabsTrigger>}
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Staff Members</h3>
            <Button onClick={() => setShowAddUserForm(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Add User Form */}
          {showAddUserForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Create a new staff account with secure ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter secure password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id">ID Number (10 digits)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="id"
                        placeholder="10-digit ID number"
                        value={newUser.id}
                        onChange={(e) => setNewUser({ ...newUser, id: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        className="font-mono"
                        maxLength={10}
                      />
                      <Button type="button" variant="outline" onClick={generateID}>
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddUserForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Staff List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffMembers.map((staff) => (
              <Card key={staff.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{staff.name}</CardTitle>
                      <CardDescription>@{staff.username}</CardDescription>
                      <p className="text-xs text-gray-500 font-mono">ID: {staff.id}</p>
                    </div>
                    <Badge className={getStatusColor(staff.status)}>{staff.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Role:</span> {staff.role}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {staff.email}
                    </p>
                    <p>
                      <span className="font-medium">Warnings:</span> {staff.warnings}
                    </p>
                    <p>
                      <span className="font-medium">Last Login:</span> {staff.lastLogin}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(staff.id)}>
                      <Key className="h-3 w-3 mr-1" />
                      Reset Password
                    </Button>
                    <Button
                      variant={staff.status === "suspended" ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleSuspendUser(staff.id)}
                    >
                      {staff.status === "suspended" ? "Reactivate" : "Suspend"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Warnings & Notes */}
        <TabsContent value="warnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Add Warning or Note</span>
              </CardTitle>
              <CardDescription>Add disciplinary warnings or notes to staff records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staffSelect">Select Staff Member</Label>
                  <Select value={selectedStaff || ""} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} (@{staff.username}) - ID: {staff.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warningText">Warning/Note Details</Label>
                <Textarea
                  id="warningText"
                  placeholder="Enter warning or note details..."
                  value={warningText}
                  onChange={(e) => setWarningText(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleAddWarning}>
                <FileText className="h-4 w-4 mr-2" />
                Add Warning/Note
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ID Scanner */}
        <TabsContent value="scanner" className="space-y-4">
          <IDScanner
            onScanComplete={(result) => {
              toast({
                title: "Scan Complete",
                description: `ID ${result.userId} processed - ${result.accessGranted ? "Access Granted" : "Access Denied"}`,
              })
            }}
          />
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Monitoring</span>
              </CardTitle>
              <CardDescription>Monitor system security and access logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">System Status</h4>
                  <p className="text-2xl font-bold text-green-600">SECURE</p>
                  <p className="text-sm text-green-600">All firewalls active</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Active Sessions</h4>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-blue-600">Authorized users online</p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Failed Attempts</h4>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                  <p className="text-sm text-yellow-600">Last 24 hours</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Security Features Active</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Firewall Protection</span>
                    <Badge className="bg-green-600">ACTIVE</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firewall">
          <AdvancedFirewall />
        </TabsContent>

        {isExecutive && (
          <TabsContent value="system" className="space-y-4">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">⚠️ DANGER ZONE - SYSTEM CONTROL</CardTitle>
                <CardDescription className="text-red-700">
                  Critical system operations - Use with extreme caution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* System Reset */}
                <div className="p-4 border border-red-300 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Complete System Reset</h4>
                  <p className="text-sm text-red-700 mb-4">
                    This will permanently delete ALL system data including users, logs, inventory, and settings.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="resetCode" className="text-red-800">
                        Enter Security Code: "Con=20=delete"
                      </Label>
                      <Input
                        id="resetCode"
                        placeholder="Enter exact security code"
                        value={resetConfirmation}
                        onChange={(e) => setResetConfirmation(e.target.value)}
                        className="border-red-300 focus:border-red-500"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleSystemReset}
                      disabled={resetConfirmation !== "Con=20=delete"}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      🗑️ RESET ENTIRE SYSTEM
                    </Button>
                  </div>
                </div>

                {/* Mass Delete Functions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-orange-300 rounded-lg bg-orange-50">
                    <h4 className="font-medium text-orange-800 mb-2">Delete All Users</h4>
                    <p className="text-sm text-orange-700 mb-3">Remove all user accounts except executives</p>
                    <Button variant="destructive" size="sm">
                      Delete All Users
                    </Button>
                  </div>

                  <div className="p-4 border border-orange-300 rounded-lg bg-orange-50">
                    <h4 className="font-medium text-orange-800 mb-2">Clear All Logs</h4>
                    <p className="text-sm text-orange-700 mb-3">Remove all system logs and activity records</p>
                    <Button variant="destructive" size="sm">
                      Clear All Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
