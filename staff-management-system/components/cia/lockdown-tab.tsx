"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock, AlertTriangle, Clock, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export function LockdownTab({ user, lockdownStatus, setLockdownStatus }: LockdownTabProps) {
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState("")
  const [isActivating, setIsActivating] = useState(false)
  const { toast } = useToast()

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
            <div className="space-y-2">
              <h4 className="font-medium">Security Team</h4>
              <p className="text-sm text-gray-600">Phone: (555) 123-SECURITY</p>
              <p className="text-sm text-gray-600">Radio: Channel 1</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Local Authorities</h4>
              <p className="text-sm text-gray-600">Emergency: 911</p>
              <p className="text-sm text-gray-600">Non-Emergency: (555) 123-POLICE</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Facility Management</h4>
              <p className="text-sm text-gray-600">Phone: (555) 123-FACILITY</p>
              <p className="text-sm text-gray-600">Email: facility@company.com</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">IT Support</h4>
              <p className="text-sm text-gray-600">Phone: (555) 123-TECH</p>
              <p className="text-sm text-gray-600">Email: support@company.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
