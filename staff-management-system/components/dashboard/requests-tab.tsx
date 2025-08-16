"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react"
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

interface Request {
  id: string
  type: "SIG" | "LOA" | "SCHEDULE" | "OTHER"
  title: string
  description: string
  status: "pending" | "approved" | "rejected"
  submittedDate: string
  approver: string
  priority: "low" | "medium" | "high"
}

interface RequestsTabProps {
  user: User
}

export function RequestsTab({ user }: RequestsTabProps) {
  const [requests, setRequests] = useState<Request[]>([])

  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const [newRequest, setNewRequest] = useState({
    type: "",
    title: "",
    description: "",
    priority: "medium",
  })
  const { toast } = useToast()

  const handleSubmitRequest = () => {
    if (!newRequest.type || !newRequest.title || !newRequest.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const request: Request = {
      id: Date.now().toString(),
      type: newRequest.type as any,
      title: newRequest.title,
      description: newRequest.description,
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
      approver: "Pending Review",
      priority: newRequest.priority as any,
    }

    setRequests([request, ...requests])
    setNewRequest({ type: "", title: "", description: "", priority: "medium" })
    setShowNewRequestForm(false)

    toast({
      title: "Request Submitted",
      description: "Your request has been submitted for approval",
    })
  }

  const handleDeleteAllRequests = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Request deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    setRequests([])
    localStorage.removeItem("requestsData")
    setShowDeleteDialog(false)
    setDeleteCode("")

    toast({
      title: "All Requests Deleted",
      description: "All request data has been permanently removed",
      variant: "destructive",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Requests</h2>
          <p className="text-gray-600">Submit and track your requests</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowNewRequestForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Requests
          </Button>
        </div>
      </div>

      {/* New Request Form */}
      {showNewRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
            <CardDescription>Fill out the form to submit a new request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIG">SIG (Special Incident Report)</SelectItem>
                    <SelectItem value="LOA">LOA (Leave of Absence)</SelectItem>
                    <SelectItem value="SCHEDULE">Schedule Change</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newRequest.priority}
                  onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Request Title</Label>
              <Input
                id="title"
                placeholder="Enter a brief title for your request"
                value={newRequest.title}
                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your request"
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewRequestForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription>
                      {request.type} • Submitted on {request.submittedDate}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                  <Badge className={getStatusColor(request.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(request.status)}
                      <span>{request.status}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{request.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Approver: {request.approver}</span>
                <span>ID: {request.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-4">Start by submitting your first request</p>
            <Button onClick={() => setShowNewRequestForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Requests</DialogTitle>
            <DialogDescription>
              This will permanently delete all request data. This action cannot be undone.
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
            <Button type="submit" variant="destructive" onClick={handleDeleteAllRequests}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
