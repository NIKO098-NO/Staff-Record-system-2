"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Scan, CheckCircle, XCircle, User, Clock, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScanResult {
  id: string
  userId: string
  userName: string
  userRole: string
  scanTime: string
  accessGranted: boolean
  location: string
  purpose: "access" | "clock-in" | "clock-out" | "verification"
}

interface IDScannerProps {
  onScanComplete?: (result: ScanResult) => void
}

export function IDScanner({ onScanComplete }: IDScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [manualId, setManualId] = useState("")
  const [scannerStatus, setScannerStatus] = useState<"ready" | "scanning" | "error">("ready")
  const { toast } = useToast()

  // Simulate hardware scanner connection
  useEffect(() => {
    // Simulate scanner initialization
    const initScanner = setTimeout(() => {
      setScannerStatus("ready")
      toast({
        title: "ID Scanner Ready",
        description: "Hardware scanner initialized and ready for use",
      })
    }, 1000)

    return () => clearTimeout(initScanner)
  }, [])

  // User database for ID verification
  const users = [
    { id: "2002211235", name: "Niko", role: "CEO" },
    { id: "9205738837", name: "Carlyle", role: "CFO" },
    { id: "7362547590", name: "Hanna", role: "COO" },
    { id: "LYAN123456", name: "Lyani", role: "HR" },
    { id: "STAFF12345", name: "John Doe", role: "STAFF" },
    { id: "MGMT123456", name: "Jane Smith", role: "MANAGER" },
  ]

  const processIdScan = (
    scannedId: string,
    purpose: "access" | "clock-in" | "clock-out" | "verification" = "access",
  ) => {
    const user = users.find((u) => u.id === scannedId)
    const scanResult: ScanResult = {
      id: Date.now().toString(),
      userId: scannedId,
      userName: user?.name || "Unknown User",
      userRole: user?.role || "UNKNOWN",
      scanTime: new Date().toISOString(),
      accessGranted: !!user,
      location: "Main Office",
      purpose,
    }

    setScanResults((prev) => [scanResult, ...prev.slice(0, 9)]) // Keep last 10 scans

    // Store in localStorage
    const storedScans = JSON.parse(localStorage.getItem("idScans") || "[]")
    localStorage.setItem("idScans", JSON.stringify([scanResult, ...storedScans.slice(0, 49)]))

    if (onScanComplete) {
      onScanComplete(scanResult)
    }

    toast({
      title: scanResult.accessGranted ? "Access Granted" : "Access Denied",
      description: scanResult.accessGranted ? `Welcome, ${scanResult.userName}` : "Invalid ID or unauthorized access",
      variant: scanResult.accessGranted ? "default" : "destructive",
    })

    return scanResult
  }

  const simulateHardwareScan = () => {
    setIsScanning(true)
    setScannerStatus("scanning")

    // Simulate hardware scan delay
    setTimeout(() => {
      // Simulate random ID scan (for demo purposes)
      const randomUser = users[Math.floor(Math.random() * users.length)]
      processIdScan(randomUser.id, "access")

      setIsScanning(false)
      setScannerStatus("ready")
    }, 2000)
  }

  const handleManualScan = () => {
    if (!manualId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an ID number",
        variant: "destructive",
      })
      return
    }

    processIdScan(manualId.trim(), "verification")
    setManualId("")
  }

  const getStatusColor = (granted: boolean) => {
    return granted ? "text-green-600" : "text-red-600"
  }

  const getStatusIcon = (granted: boolean) => {
    return granted ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="h-6 w-6 text-blue-600" />
            <span>Hardware ID Scanner</span>
            <Badge
              variant={
                scannerStatus === "ready" ? "default" : scannerStatus === "scanning" ? "secondary" : "destructive"
              }
            >
              {scannerStatus.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>Scan employee ID cards for access control and time tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hardware Scanner */}
          <div className="text-center">
            <div
              className={`mx-auto w-64 h-40 border-4 border-dashed rounded-lg flex items-center justify-center ${
                isScanning ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-blue-600 font-medium">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Scan className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Place ID card here</p>
                </div>
              )}
            </div>

            <Button
              onClick={simulateHardwareScan}
              disabled={isScanning || scannerStatus !== "ready"}
              className="mt-4"
              size="lg"
            >
              {isScanning ? "Scanning..." : "Activate Scanner"}
            </Button>
          </div>

          {/* Manual ID Entry */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-3">Manual ID Entry</h4>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter 10-digit ID number"
                value={manualId}
                onChange={(e) => setManualId(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                className="font-mono"
              />
              <Button onClick={handleManualScan} disabled={manualId.length !== 10}>
                Verify ID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Scans</span>
          </CardTitle>
          <CardDescription>Latest ID scan results and access logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scanResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Scan className="h-12 w-12 mx-auto mb-2" />
                <p>No scans performed yet</p>
              </div>
            ) : (
              scanResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={getStatusColor(result.accessGranted)}>{getStatusIcon(result.accessGranted)}</div>
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{result.userName}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {result.userId} • {result.userRole} • {result.purpose}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(result.scanTime).toLocaleString()} • {result.location}
                      </p>
                    </div>
                  </div>
                  <Badge variant={result.accessGranted ? "default" : "destructive"}>
                    {result.accessGranted ? "GRANTED" : "DENIED"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scanner Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Scanner Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {scanResults.filter((r) => r.accessGranted).length}
              </div>
              <p className="text-sm text-green-700">Successful Scans</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {scanResults.filter((r) => !r.accessGranted).length}
              </div>
              <p className="text-sm text-red-700">Denied Access</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{scanResults.length}</div>
              <p className="text-sm text-blue-700">Total Scans</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
