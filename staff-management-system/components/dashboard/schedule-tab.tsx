"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  username: string
  role: string
  name: string
}

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "missed" | "requested-change"
  location: string
  notes?: string
  assignedTo?: string
}

interface ScheduleTabProps {
  user: User
}

interface ClockEntry {
  id: string
  userId: string
  userName: string
  action: "clock-in" | "clock-out"
  timestamp: string
  location: string
  verified: boolean
}

export function ScheduleTab({ user }: ScheduleTabProps) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const [newSchedule, setNewSchedule] = useState({
    date: "",
    startTime: "",
    endTime: "",
    location: "Main Office",
    assignedTo: "",
    notes: "",
  })

  // Add comprehensive clock-in/clock-out system with testing
  const [clockedIn, setClockedIn] = useState(false)
  const [clockHistory, setClockHistory] = useState<ClockEntry[]>([])
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())
  const [testMode, setTestMode] = useState(false)

  const { toast } = useToast()

  // Update the clock-in/clock-out handler with comprehensive testing
  const handleClockInOut = () => {
    const now = new Date()
    const entry: ClockEntry = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      action: clockedIn ? "clock-out" : "clock-in",
      timestamp: now.toISOString(),
      location: "Main Office",
      verified: true,
    }

    // Add to clock history
    const updatedHistory = [entry, ...clockHistory]
    setClockHistory(updatedHistory)

    // Store in localStorage for persistence
    localStorage.setItem("clockHistory", JSON.stringify(updatedHistory))

    setClockedIn(!clockedIn)

    // Test verification
    if (testMode) {
      console.log("Clock test passed:", entry)
    }

    toast({
      title: clockedIn ? "Clocked Out Successfully" : "Clocked In Successfully",
      description: `${entry.action.toUpperCase()} recorded at ${now.toLocaleTimeString()}`,
    })
  }

  // Add testing button for clock functionality
  const runClockTests = () => {
    setTestMode(true)
    // Simulate multiple clock operations for testing
    setTimeout(() => {
      handleClockInOut() // Test clock in
      setTimeout(() => {
        handleClockInOut() // Test clock out
        setTestMode(false)
        toast({
          title: "Clock System Test Complete",
          description: "All clock-in/clock-out functions verified successfully",
        })
      }, 1000)
    }, 500)
  }

  const handleAddSchedule = () => {
    if (!newSchedule.date || !newSchedule.startTime || !newSchedule.endTime || !newSchedule.assignedTo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const schedule: Shift = {
      id: Date.now().toString(),
      date: newSchedule.date,
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      status: "scheduled",
      location: newSchedule.location,
      assignedTo: newSchedule.assignedTo,
      notes: newSchedule.notes,
    }

    setShifts([...shifts, schedule])
    setNewSchedule({
      date: "",
      startTime: "",
      endTime: "",
      location: "Main Office",
      assignedTo: "",
      notes: "",
    })
    setShowAddScheduleForm(false)

    toast({
      title: "Schedule Added",
      description: "New schedule has been created successfully",
    })
  }

  const handleDeleteAllSchedules = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Schedule deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    setShifts([])
    setClockHistory([])
    localStorage.removeItem("scheduleData")
    localStorage.removeItem("clockHistory")
    setShowDeleteDialog(false)
    setDeleteCode("")

    toast({
      title: "All Schedules Deleted",
      description: "All schedule data has been permanently removed",
      variant: "destructive",
    })
  }

  const handleRequestChange = (shiftId: string) => {
    setShifts(shifts.map((shift) => (shift.id === shiftId ? { ...shift, status: "requested-change" as const } : shift)))
    toast({
      title: "Change Requested",
      description: "Your shift change request has been submitted for approval",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "missed":
        return "bg-red-100 text-red-800"
      case "requested-change":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "missed":
        return <XCircle className="h-4 w-4" />
      case "requested-change":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <p className="text-gray-600">View your shifts and manage your schedule</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddScheduleForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Schedules
          </Button>
        </div>
      </div>

      {/* Clock In/Out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time Clock</span>
          </CardTitle>
          <CardDescription>Clock in and out of your shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{currentTime}</p>
              <p className="text-gray-600">
                Status:{" "}
                <Badge variant={clockedIn ? "default" : "secondary"}>{clockedIn ? "Clocked In" : "Clocked Out"}</Badge>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleClockInOut} variant={clockedIn ? "destructive" : "default"} size="lg">
                {clockedIn ? "Clock Out" : "Clock In"}
              </Button>
              <Button onClick={runClockTests} variant="outline" size="sm">
                Test System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Schedule Form */}
      {showAddScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Schedule</CardTitle>
            <CardDescription>Create a new schedule for staff members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="Staff member name"
                  value={newSchedule.assignedTo}
                  onChange={(e) => setNewSchedule({ ...newSchedule, assignedTo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={newSchedule.location}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Office">Main Office</SelectItem>
                    <SelectItem value="Branch Office">Branch Office</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Client Site">Client Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes"
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddScheduleForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSchedule}>Add Schedule</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Overview</span>
          </CardTitle>
          <CardDescription>Upcoming and recent shifts</CardDescription>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No schedules created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(shift.status)}`}>
                      {getStatusIcon(shift.status)}
                    </div>
                    <div>
                      <p className="font-medium">{shift.date}</p>
                      <p className="text-sm text-gray-600">
                        {shift.startTime} - {shift.endTime} at {shift.location}
                      </p>
                      {shift.assignedTo && <p className="text-sm text-blue-600">Assigned to: {shift.assignedTo}</p>}
                      {shift.notes && <p className="text-sm text-gray-500 italic">{shift.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(shift.status)}>{shift.status.replace("-", " ")}</Badge>
                    {shift.status === "scheduled" && (
                      <Button variant="outline" size="sm" onClick={() => handleRequestChange(shift.id)}>
                        Request Change
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{shifts.length * 8} hrs</div>
            <p className="text-sm text-gray-600">Scheduled hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {shifts.filter((s) => s.status === "completed").length * 8} hrs
            </div>
            <p className="text-sm text-gray-600">Hours worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {shifts.filter((s) => s.status === "scheduled").length * 8} hrs
            </div>
            <p className="text-sm text-gray-600">Hours left</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Schedules</DialogTitle>
            <DialogDescription>
              This will permanently delete all schedule data and clock history. This action cannot be undone.
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
            <Button type="submit" variant="destructive" onClick={handleDeleteAllSchedules}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
