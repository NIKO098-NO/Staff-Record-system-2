"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Plus, Search, FileText, Users, Trash2 } from "lucide-react"
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

interface Investigation {
  id: string
  title: string
  type: "security" | "misconduct" | "policy" | "incident"
  status: "active" | "pending" | "closed" | "suspended"
  priority: "low" | "medium" | "high" | "critical"
  assignedTo: string
  createdBy: string
  createdDate: string
  lastUpdated: string
  description: string
  involvedPersonnel: string[]
  evidence: string[]
  notes: string[]
}

interface InvestigationTabProps {
  user: User
}

export function InvestigationTab({ user }: InvestigationTabProps) {
  const [investigations, setInvestigations] = useState<Investigation[]>([])

  const [showNewInvestigation, setShowNewInvestigation] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newInvestigation, setNewInvestigation] = useState({
    title: "",
    type: "incident",
    priority: "medium",
    description: "",
    involvedPersonnel: "",
  })
  const { toast } = useToast()

  const filteredInvestigations = investigations.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || inv.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleCreateInvestigation = () => {
    if (!newInvestigation.title || !newInvestigation.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const investigation: Investigation = {
      id: `INV-${String(investigations.length + 1).padStart(3, "0")}`,
      title: newInvestigation.title,
      type: newInvestigation.type as any,
      status: "active",
      priority: newInvestigation.priority as any,
      assignedTo: user.name + " (" + user.role + ")",
      createdBy: user.name + " (" + user.role + ")",
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      description: newInvestigation.description,
      involvedPersonnel: newInvestigation.involvedPersonnel
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p),
      evidence: [],
      notes: ["Investigation created"],
    }

    setInvestigations([investigation, ...investigations])
    setNewInvestigation({ title: "", type: "incident", priority: "medium", description: "", involvedPersonnel: "" })
    setShowNewInvestigation(false)

    toast({
      title: "Investigation Created",
      description: `Investigation ${investigation.id} has been created`,
    })
  }

  const handleDeleteAllInvestigations = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Investigation deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    setInvestigations([])
    localStorage.removeItem("investigationData")
    setShowDeleteDialog(false)
    setDeleteCode("")

    toast({
      title: "All Investigations Deleted",
      description: "All investigation data has been permanently removed",
      variant: "destructive",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "security":
        return "bg-red-100 text-red-800"
      case "misconduct":
        return "bg-purple-100 text-purple-800"
      case "policy":
        return "bg-blue-100 text-blue-800"
      case "incident":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Investigation Management</h2>
          <p className="text-gray-400">Manage and track ongoing investigations</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowNewInvestigation(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Investigation
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Investigations
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
                  placeholder="Search investigations..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* New Investigation Form */}
      {showNewInvestigation && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Create New Investigation</CardTitle>
            <CardDescription className="text-gray-400">Start a new investigation case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-200">
                  Investigation Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter investigation title"
                  value={newInvestigation.title}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, title: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-200">
                  Type
                </Label>
                <Select
                  value={newInvestigation.type}
                  onValueChange={(value) => setNewInvestigation({ ...newInvestigation, type: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="misconduct">Misconduct</SelectItem>
                    <SelectItem value="policy">Policy Violation</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-gray-200">
                  Priority
                </Label>
                <Select
                  value={newInvestigation.priority}
                  onValueChange={(value) => setNewInvestigation({ ...newInvestigation, priority: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personnel" className="text-gray-200">
                  Involved Personnel
                </Label>
                <Input
                  id="personnel"
                  placeholder="Names separated by commas"
                  value={newInvestigation.involvedPersonnel}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, involvedPersonnel: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-200">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the investigation"
                value={newInvestigation.description}
                onChange={(e) => setNewInvestigation({ ...newInvestigation, description: e.target.value })}
                rows={3}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewInvestigation(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateInvestigation} className="bg-blue-600 hover:bg-blue-700">
                Create Investigation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investigation List */}
      <div className="space-y-4">
        {filteredInvestigations.map((investigation) => (
          <Card key={investigation.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <div>
                    <CardTitle className="text-lg text-gray-100">{investigation.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {investigation.id} • Created by {investigation.createdBy} on {investigation.createdDate}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(investigation.type)}>{investigation.type}</Badge>
                  <Badge className={getPriorityColor(investigation.priority)}>{investigation.priority}</Badge>
                  <Badge className={getStatusColor(investigation.status)}>{investigation.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{investigation.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-200 mb-2">Investigation Details</h4>
                  <div className="space-y-1 text-gray-400">
                    <p>
                      <strong>Assigned to:</strong> {investigation.assignedTo}
                    </p>
                    <p>
                      <strong>Last updated:</strong> {investigation.lastUpdated}
                    </p>
                    <p>
                      <strong>Personnel involved:</strong>{" "}
                      {investigation.involvedPersonnel.join(", ") || "None specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-200 mb-2">Evidence & Notes</h4>
                  <div className="space-y-1 text-gray-400">
                    <p>
                      <strong>Evidence items:</strong> {investigation.evidence.length}
                    </p>
                    <p>
                      <strong>Notes:</strong> {investigation.notes.length}
                    </p>
                    <p>
                      <strong>Latest note:</strong> {investigation.notes[investigation.notes.length - 1] || "No notes"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvestigations.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-100 mb-2">No investigations found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by creating your first investigation"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setShowNewInvestigation(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Investigation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Investigations</DialogTitle>
            <DialogDescription>
              This will permanently delete all investigation data. This action cannot be undone.
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
            <Button type="submit" variant="destructive" onClick={handleDeleteAllInvestigations}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
