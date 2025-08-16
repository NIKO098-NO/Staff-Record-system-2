"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Search, AlertTriangle, FileText, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  username: string
  role: string
  name: string
}

interface StaffRecord {
  id: string
  name: string
  username: string
  role: string
  email: string
  status: "active" | "suspended" | "inactive" | "under_investigation"
  warnings: Warning[]
  suspensions: Suspension[]
  notes: Note[]
  lastLogin: string
  joinDate: string
  department: string
}

interface Warning {
  id: string
  date: string
  issuedBy: string
  reason: string
  severity: "minor" | "major" | "severe"
  resolved: boolean
}

interface Suspension {
  id: string
  startDate: string
  endDate: string
  reason: string
  issuedBy: string
  status: "active" | "completed" | "lifted"
}

interface Note {
  id: string
  date: string
  addedBy: string
  content: string
  type: "general" | "disciplinary" | "performance" | "investigation"
}

interface StaffRecordsTabProps {
  user: User
}

export function StaffRecordsTab({ user }: StaffRecordsTabProps) {
  const [staffRecords, setStaffRecords] = useState<StaffRecord[]>([
    {
      id: "STAFF12345",
      name: "John Doe",
      username: "john_doe",
      role: "STAFF",
      email: "john.doe@company.com",
      status: "active",
      warnings: [
        {
          id: "W001",
          date: "2024-01-10",
          issuedBy: "Jane Smith (Manager)",
          reason: "Late arrival to shift",
          severity: "minor",
          resolved: true,
        },
      ],
      suspensions: [],
      notes: [
        {
          id: "N001",
          date: "2024-01-15",
          addedBy: "Jane Smith (Manager)",
          content: "Good performance in recent projects",
          type: "performance",
        },
      ],
      lastLogin: "2024-01-15",
      joinDate: "2023-06-15",
      department: "Operations",
    },
    {
      id: "STAFF67890",
      name: "Alice Johnson",
      username: "alice_j",
      role: "STAFF",
      email: "alice.johnson@company.com",
      status: "active",
      warnings: [],
      suspensions: [],
      notes: [],
      lastLogin: "2024-01-14",
      joinDate: "2023-08-20",
      department: "Sales",
    },
    {
      id: "STAFF11111",
      name: "Bob Wilson",
      username: "bob_w",
      role: "STAFF",
      email: "bob.wilson@company.com",
      status: "suspended",
      warnings: [
        {
          id: "W002",
          date: "2024-01-05",
          issuedBy: "Lyani (HR)",
          reason: "Policy violation - inappropriate conduct",
          severity: "severe",
          resolved: false,
        },
        {
          id: "W003",
          date: "2024-01-08",
          issuedBy: "Lyani (HR)",
          reason: "Failure to comply with corrective action",
          severity: "major",
          resolved: false,
        },
      ],
      suspensions: [
        {
          id: "S001",
          startDate: "2024-01-10",
          endDate: "2024-01-17",
          reason: "Multiple policy violations",
          issuedBy: "Niko (CEO)",
          status: "active",
        },
      ],
      notes: [
        {
          id: "N002",
          date: "2024-01-10",
          addedBy: "Lyani (HR)",
          content: "Under investigation for workplace misconduct",
          type: "investigation",
        },
      ],
      lastLogin: "2024-01-09",
      joinDate: "2023-03-10",
      department: "Operations",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formType, setFormType] = useState<"warning" | "note" | "suspension">("warning")
  const [formData, setFormData] = useState({
    reason: "",
    content: "",
    severity: "minor",
    type: "general",
    endDate: "",
  })
  const { toast } = useToast()

  const filteredStaff = staffRecords.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || staff.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleAddRecord = () => {
    if (!selectedStaff) return

    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      addedBy: `${user.name} (${user.role})`,
      ...formData,
    }

    setStaffRecords(
      staffRecords.map((staff) => {
        if (staff.id === selectedStaff.id) {
          const updatedStaff = { ...staff }

          if (formType === "warning") {
            updatedStaff.warnings = [
              ...staff.warnings,
              {
                ...newRecord,
                reason: formData.reason,
                severity: formData.severity as any,
                resolved: false,
              },
            ]
          } else if (formType === "note") {
            updatedStaff.notes = [
              ...staff.notes,
              {
                ...newRecord,
                content: formData.content,
                type: formData.type as any,
              },
            ]
          } else if (formType === "suspension") {
            updatedStaff.suspensions = [
              ...staff.suspensions,
              {
                ...newRecord,
                startDate: newRecord.date,
                endDate: formData.endDate,
                reason: formData.reason,
                status: "active" as any,
              },
            ]
            updatedStaff.status = "suspended"
          }

          return updatedStaff
        }
        return staff
      }),
    )

    setFormData({ reason: "", content: "", severity: "minor", type: "general", endDate: "" })
    setShowAddForm(false)
    setSelectedStaff(null)

    toast({
      title: "Record Added",
      description: `${formType.charAt(0).toUpperCase() + formType.slice(1)} has been added to staff record`,
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
      case "under_investigation":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-yellow-100 text-yellow-800"
      case "major":
        return "bg-orange-100 text-orange-800"
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Staff Records</h2>
          <p className="text-gray-400">View and manage comprehensive staff records</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
          disabled={!selectedStaff}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="under_investigation">Under Investigation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Record Form */}
      {showAddForm && selectedStaff && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Add Record for {selectedStaff.name}</CardTitle>
            <CardDescription className="text-gray-400">Add a new warning, note, or suspension</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Record Type</Label>
              <Select value={formType} onValueChange={(value: any) => setFormType(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formType === "warning" && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-200">Reason</Label>
                  <Input
                    placeholder="Enter warning reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-200">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formType === "note" && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-200">Note Content</Label>
                  <Textarea
                    placeholder="Enter note content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-200">Note Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="disciplinary">Disciplinary</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="investigation">Investigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formType === "suspension" && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-200">Suspension Reason</Label>
                  <Input
                    placeholder="Enter suspension reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-200">End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleAddRecord} className="bg-purple-600 hover:bg-purple-700">
                Add Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Records List */}
      <div className="space-y-4">
        {filteredStaff.map((staff) => (
          <Card
            key={staff.id}
            className={`bg-gray-800 border-gray-700 cursor-pointer transition-colors ${
              selectedStaff?.id === staff.id ? "ring-2 ring-purple-500" : "hover:bg-gray-750"
            }`}
            onClick={() => setSelectedStaff(selectedStaff?.id === staff.id ? null : staff)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-700 text-gray-200">
                      {staff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-gray-100">{staff.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      @{staff.username} • {staff.role} • {staff.department}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(staff.status)}>{staff.status.replace("_", " ")}</Badge>
                  {staff.warnings.length > 0 && <Badge variant="destructive">{staff.warnings.length} warnings</Badge>}
                  {staff.suspensions.some((s) => s.status === "active") && (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {selectedStaff?.id === staff.id && (
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Basic Information</h4>
                    <div className="space-y-1 text-gray-400">
                      <p>
                        <strong>Email:</strong> {staff.email}
                      </p>
                      <p>
                        <strong>Join Date:</strong> {staff.joinDate}
                      </p>
                      <p>
                        <strong>Last Login:</strong> {staff.lastLogin}
                      </p>
                      <p>
                        <strong>Department:</strong> {staff.department}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Record Summary</h4>
                    <div className="space-y-1 text-gray-400">
                      <p>
                        <strong>Warnings:</strong> {staff.warnings.length}
                      </p>
                      <p>
                        <strong>Suspensions:</strong> {staff.suspensions.length}
                      </p>
                      <p>
                        <strong>Notes:</strong> {staff.notes.length}
                      </p>
                      <p>
                        <strong>Status:</strong> {staff.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {staff.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Warnings ({staff.warnings.length})
                    </h4>
                    <div className="space-y-2">
                      {staff.warnings.map((warning) => (
                        <div key={warning.id} className="p-3 bg-gray-700 rounded border-l-4 border-yellow-500">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-gray-200 font-medium">{warning.reason}</p>
                              <p className="text-sm text-gray-400">
                                Issued by {warning.issuedBy} on {warning.date}
                              </p>
                            </div>
                            <Badge className={getSeverityColor(warning.severity)}>{warning.severity}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suspensions */}
                {staff.suspensions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Suspensions ({staff.suspensions.length})
                    </h4>
                    <div className="space-y-2">
                      {staff.suspensions.map((suspension) => (
                        <div key={suspension.id} className="p-3 bg-gray-700 rounded border-l-4 border-red-500">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-gray-200 font-medium">{suspension.reason}</p>
                              <p className="text-sm text-gray-400">
                                {suspension.startDate} to {suspension.endDate} • Issued by {suspension.issuedBy}
                              </p>
                            </div>
                            <Badge variant={suspension.status === "active" ? "destructive" : "secondary"}>
                              {suspension.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {staff.notes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Notes ({staff.notes.length})
                    </h4>
                    <div className="space-y-2">
                      {staff.notes.map((note) => (
                        <div key={note.id} className="p-3 bg-gray-700 rounded border-l-4 border-blue-500">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-gray-200">{note.content}</p>
                              <p className="text-sm text-gray-400">
                                Added by {note.addedBy} on {note.date}
                              </p>
                            </div>
                            <Badge variant="secondary">{note.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-100 mb-2">No staff records found</h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No staff records available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
