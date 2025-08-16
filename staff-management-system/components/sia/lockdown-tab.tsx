"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock, AlertTriangle, Clock, Shield, Edit, Trash2 } from "lucide-react"
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

interface LockdownTabProps {
  user: User
  lockdownStatus: boolean
  setLockdownStatus: (status: boolean) => void
}

interface EmergencyContact {
  id: string
  title: string
  phone: string
  email?: string
  radio?: string
}

export function LockdownTab({ user, lockdownStatus, setLockdownStatus }: LockdownTabProps) {
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState("")
  const [isActivating, setIsActivating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditContactDialog, setShowEditContactDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const { toast } = useToast()

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: "1",
      title: "Security Team",
      phone: "(555) 123-SECURITY",
      radio: "Channel 1",
    },
    {
      id: "2",
      title: "Local Authorities",
      phone: "911",
      email: "emergency@police.gov",
    },
    {
      id: "3",
      title: "Facility Management",
      phone: "(555) 123-FACILITY",
      email: "facility@company.com",
    },
    {
      id: "4",
      title: "IT Support",
      phone: "(555) 123-TECH",
      email: "support@company.com",
    },
  ])

  const lockdownHistory = [
    {
      id: "1",
      activatedBy: "Niko (CEO)",
      reason: "Security breach investigation",
      startTime: "2024-01-10 14:30",
      endTime: "2024-01-10 16:45",
      duration: "2h 15m",
      status: "completed",
    },
    {
      id: "2",
      activatedBy: "Hanna (COO)",
      reason: "Emergency maintenance",
      startTime: "2024-01-05 09:00",
      endTime: "2024-01-05 12:00",
      duration: "3h 00m",
      status: "completed",
    },
  ]

  const handleActivateLockdown = async () => {
    if (!reason.trim() || !duration.trim()) {
      toast({
        title: "Error",
        description: "Please provide both reason and duration for lockdown",
        variant: "destructive",
      })
      return
    }

    setIsActivating(true)

    // Simulate activation delay
    setTimeout(() => {
      setLockdownStatus(true)
      setReason("")
      setDuration("")
      setIsActivating(false)

      toast({
        title: "LOCKDOWN ACTIVATED",
        description: `Facility lockdown initiated by ${user.name}`,
        variant: "destructive",
      })
    }, 2000)
  }

  const handleCancelLockdown = () => {
    setLockdownStatus(false)
    toast({
      title: "LOCKDOWN CANCELLED",
      description: `Lockdown cancelled by ${user.name}`,
    })
  }

  const handleDeleteAllLockdownData = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Lockdown data deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    // Reset lockdown status and clear data
    setLockdownStatus(false)
    localStorage.removeItem("lockdownData")
    setShowDeleteDialog(false)
    setDeleteCode("")

    toast({
      title: "All Lockdown Data Deleted",
      description: "All lockdown history and settings have been permanently removed",
      variant: "destructive",
    })
  }

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setShowEditContactDialog(true)
  }

  const handleSaveContact = () => {
    if (!editingContact) return

    setEmergencyContacts(
      emergencyContacts.map((contact) => (contact.id === editingContact.id ? editingContact : contact)),
    )
    setShowEditContactDialog(false)
    setEditingContact(null)

    toast({
      title: "Contact Updated",
      description: "Emergency contact information has been updated",
    })
  }

  const isExecutive = ["CEO", "CFO", "COO"].includes(user.role)

  if (!isExecutive) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Lockdown controls are restricted to CEO, CFO, and COO only.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lockdown Control</h2>
          <p className="text-gray-600">Emergency facility lockdown management</p>
        </div>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All Lockdown Data
        </Button>
      </div>

      {/* Current Status */}
      <Card className={lockdownStatus ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${lockdownStatus ? "text-red-800" : "text-green-800"}`}>
            {lockdownStatus ? <Lock className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
            <span>Facility Status: {lockdownStatus ? "LOCKDOWN ACTIVE" : "NORMAL OPERATIONS"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lockdownStatus ? (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <strong>FACILITY LOCKDOWN IN EFFECT</strong>
                  <br />
                  All access points are secured. Only authorized personnel may enter or exit.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">
                    <strong>Activated:</strong> {new Date().toLocaleString()}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Authorized by:</strong> {user.name} ({user.role})
                  </p>
                </div>
                <Button variant="destructive" onClick={handleCancelLockdown} className="bg-red-600 hover:bg-red-700">
                  <Unlock className="h-4 w-4 mr-2" />
                  Cancel Lockdown
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-green-800">
              <p className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>All systems operational. Facility access is normal.</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lockdown Controls */}
      {!lockdownStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800">Activate Emergency Lockdown</CardTitle>
            <CardDescription>
              Initiate facility-wide lockdown. This action requires executive authorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-800">
                <strong>Warning:</strong> Activating lockdown will immediately secure all access points and restrict
                facility access. Use only in emergency situations.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Lockdown Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter detailed reason for lockdown activation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Expected Duration *</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 hours, 30 minutes, indefinite"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleActivateLockdown}
                  disabled={isActivating || !reason.trim() || !duration.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isActivating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Activating Lockdown...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      ACTIVATE LOCKDOWN
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lockdown History */}
      <Card>
        <CardHeader>
          <CardTitle>Lockdown History</CardTitle>
          <CardDescription>Previous lockdown activations and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lockdownHistory.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{entry.reason}</h4>
                  <Badge variant="secondary">{entry.status}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p>
                    <strong>Activated by:</strong> {entry.activatedBy}
                  </p>
                  <p>
                    <strong>Duration:</strong> {entry.duration}
                  </p>
                  <p>
                    <strong>Start:</strong> {entry.startTime}
                  </p>
                  <p>
                    <strong>End:</strong> {entry.endTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>Key personnel to notify during lockdown situations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{contact.title}</h4>
                  <Button variant="outline" size="sm" onClick={() => handleEditContact(contact)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Phone: {contact.phone}</p>
                {contact.email && <p className="text-sm text-gray-600">Email: {contact.email}</p>}
                {contact.radio && <p className="text-sm text-gray-600">Radio: {contact.radio}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Lockdown Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all lockdown history and reset all settings. This action cannot be undone.
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
            <Button type="submit" variant="destructive" onClick={handleDeleteAllLockdownData}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditContactDialog} onOpenChange={setShowEditContactDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Emergency Contact</DialogTitle>
            <DialogDescription>Update emergency contact information</DialogDescription>
          </DialogHeader>
          {editingContact && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingContact.title}
                  onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editingContact.phone}
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editingContact.email || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="radio" className="text-right">
                  Radio
                </Label>
                <Input
                  id="radio"
                  value={editingContact.radio || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, radio: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowEditContactDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveContact}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
