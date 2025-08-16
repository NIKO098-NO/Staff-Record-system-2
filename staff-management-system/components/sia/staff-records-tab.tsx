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
import { Users, Search, AlertTriangle, FileText, Plus, Trash2, Download, Edit } from "lucide-react"
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
  const [staffRecords, setStaffRecords] = useState<StaffRecord[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditIdDialog, setShowEditIdDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const [formType, setFormType] = useState<"warning" | "note" | "suspension">("warning")
  const [formData, setFormData] = useState({
    reason: "",
    content: "",
    severity: "minor",
    type: "general",
    endDate: "",
  })
  const [editingStaffId, setEditingStaffId] = useState("")
  const [newStaffId, setNewStaffId] = useState("")
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

  const handleDeleteAllStaffRecords = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Staff records deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    setStaffRecords([])
    localStorage.removeItem("staffRecords")
    setShowDeleteDialog(false)
    setDeleteCode("")

    toast({
      title: "All Staff Records Deleted",
      description: "All staff record data has been permanently removed",
      variant: "destructive",
    })
  }

  const handleEditStaffId = (staffId: string) => {
    setEditingStaffId(staffId)
    const staff = staffRecords.find((s) => s.id === staffId)
    setNewStaffId(staff?.id || "")
    setShowEditIdDialog(true)
  }

  const handleSaveStaffId = () => {
    if (!newStaffId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid ID",
        variant: "destructive",
      })
      return
    }

    setStaffRecords(staffRecords.map((staff) => (staff.id === editingStaffId ? { ...staff, id: newStaffId } : staff)))

    setShowEditIdDialog(false)
    setEditingStaffId("")
    setNewStaffId("")

    toast({
      title: "Staff ID Updated",
      description: "Staff ID has been successfully updated",
    })
  }

  const generateStaffId = () => {
    const id = Math.floor(1000000000 + Math.random() * 9000000000).toString()
    setNewStaffId(id)
  }

  const downloadStaffRecordsPDF = () => {
    // Create PDF content
    const pdfContent = staffRecords
      .map(
        (staff) => `
Staff Record - ${staff.name}
ID: ${staff.id}
Username: ${staff.username}
Role: ${staff.role}
Email: ${staff.email}
Status: ${staff.status}
Department: ${staff.department}
Join Date: ${staff.joinDate}
Last Login: ${staff.lastLogin}

Warnings: ${staff.warnings.length}
${staff.warnings.map((w) => `- ${w.date}: ${w.reason} (${w.severity})`).join("\n")}

Suspensions: ${staff.suspensions.length}
${staff.suspensions.map((s) => `- ${s.startDate} to ${s.endDate}: ${s.reason}`).join("\n")}

Notes: ${staff.notes.length}
${staff.notes.map((n) => `- ${n.date}: ${n.content} (${n.type})`).join("\n")}

-------------------
`,
      )
      .join("\n")

    // Create and download file
    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `staff-records-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Records Downloaded",
      description: "Staff records have been downloaded as a text file",
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
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!selectedStaff}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
          <Button onClick={downloadStaffRecordsPDF} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Records
          </Button>
        </div>
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
                  <Label className="text-gray-200">Content</Label>
                  <Textarea
                    placeholder="Enter note content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-200">Type</Label>
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
                  <Label className="text-gray-200">Reason</Label>
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

      {/* Staff List */}
      <div className="space-y-4">
        {filteredStaff.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">No staff records found</h3>
              <p className="text-gray-400">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Staff records will appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStaff.map((staff) => (
            <Card
              key={staff.id}
              className={`bg-gray-800 border-gray-700 cursor-pointer ${selectedStaff?.id === staff.id ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelectedStaff(staff)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-gray-100">{staff.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {staff.role} • {staff.department}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(staff.status)}>{staff.status.replace("_", " ")}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditStaffId(staff.id)
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit ID
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                  <p>
                    <strong>ID:</strong> {staff.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {staff.email}
                  </p>
                  <p>
                    <strong>Join Date:</strong> {staff.joinDate}
                  </p>
                  <p>
                    <strong>Last Login:</strong> {staff.lastLogin}
                  </p>
                </div>

                {staff.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-200">Warnings ({staff.warnings.length})</h4>
                    {staff.warnings.map((warning) => (
                      <div key={warning.id} className="flex items-center space-x-2 text-sm text-gray-400">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className={getSeverityColor(warning.severity)}>{warning.severity}</span>
                        <span>
                          {warning.date}: {warning.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {staff.suspensions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-200">Suspensions ({staff.suspensions.length})</h4>
                    {staff.suspensions.map((suspension) => (
                      <div key={suspension.id} className="flex items-center space-x-2 text-sm text-gray-400">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <Badge variant="destructive">{suspension.status}</Badge>
                        <span>
                          {suspension.startDate} - {suspension.endDate}: {suspension.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {staff.notes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-200">Notes ({staff.notes.length})</h4>
                    {staff.notes.map((note) => (
                      <div key={note.id} className="flex items-center space-x-2 text-sm text-gray-400">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <Badge variant="secondary">{note.type}</Badge>
                        <span>
                          {note.date}: {note.content}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Staff Records</DialogTitle>
            <DialogDescription>
              This will permanently delete all staff records and associated data. This action cannot be undone.
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
            <Button type="submit" variant="destructive" onClick={handleDeleteAllStaffRecords}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditIdDialog} onOpenChange={setShowEditIdDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff ID</DialogTitle>
            <DialogDescription>Update the ID for the selected staff member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newStaffId" className="text-right">
                New Staff ID
              </Label>
              <Input
                id="newStaffId"
                value={newStaffId}
                onChange={(e) => setNewStaffId(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="col-span-4 flex justify-end">
              <Button variant="outline" onClick={generateStaffId}>
                Auto-Generate ID
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowEditIdDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveStaffId}>
              Save ID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
