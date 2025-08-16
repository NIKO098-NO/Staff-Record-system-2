"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Shield, AlertTriangle, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Enhanced user database with new ID numbers
const users = [
  { id: "2002211235", username: "niko20", password: "Nikoceo25", role: "CEO", name: "Niko", clearanceLevel: 5 },
  {
    id: "9205738837",
    username: "Carlyle20",
    password: "Carlylecfo00",
    role: "CFO",
    name: "Carlyle",
    clearanceLevel: 5,
  },
  { id: "7362547590", username: "Hanna20", password: "Hannacoo10", role: "COO", name: "Hanna", clearanceLevel: 5 },
  { id: "LYAN123456", username: "Lyani", password: "Lyanihr29", role: "HR", name: "Lyani", clearanceLevel: 3 },
  {
    id: "MGMT123456",
    username: "jane_smith",
    password: "manager123",
    role: "MANAGER",
    name: "Jane Smith",
    clearanceLevel: 3,
  },
]

// Enhanced security for CIA portal
const ciaSecurityLog = {
  failedAttempts: 0,
  lastAttempt: null as Date | null,
  blockedIPs: [] as string[],
  securityBreaches: [] as any[],
  accessAttempts: [] as any[],
}

export default function CIAPortalLogin() {
  const [idCode, setIdCode] = useState("")
  const [cooCode, setCooCode] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [securityLevel, setSecurityLevel] = useState("DEFCON 5")
  const router = useRouter()
  const { toast } = useToast()

  const validateCooCode = (code: string) => {
    // Only digits 2, 3, 4 are accepted for COO
    return code.length === 3 && /^[234]+$/.test(code)
  }

  // Enhanced security check for CIA portal
  const checkCIASecurity = () => {
    const now = new Date()

    // More strict rate limiting for CIA portal
    if (ciaSecurityLog.lastAttempt && now.getTime() - ciaSecurityLog.lastAttempt.getTime() < 2000) {
      ciaSecurityLog.failedAttempts++
      if (ciaSecurityLog.failedAttempts > 2) {
        setSecurityLevel("DEFCON 3")
        toast({
          title: "SECURITY BREACH DETECTED",
          description: "Multiple unauthorized access attempts. Authorities notified.",
          variant: "destructive",
        })
        return false
      }
    }

    ciaSecurityLog.lastAttempt = now
    return true
  }

  const handleLogin = async (loginType: "id" | "coo" | "credentials") => {
    if (!checkCIASecurity()) return

    setIsLoading(true)

    try {
      let user = null

      // Log all access attempts
      ciaSecurityLog.accessAttempts.push({
        type: loginType,
        timestamp: new Date().toISOString(),
        data: loginType === "id" ? idCode : loginType === "coo" ? cooCode : username,
      })

      if (loginType === "id") {
        user = users.find((u) => u.id === idCode)
        if (!user || !["CEO", "CFO", "COO", "HR", "MANAGER"].includes(user.role)) {
          ciaSecurityLog.failedAttempts++
          ciaSecurityLog.securityBreaches.push({
            type: "unauthorized_id_access",
            attempt: idCode,
            timestamp: new Date().toISOString(),
            threat_level: "HIGH",
          })

          toast({
            title: "ACCESS DENIED",
            description: "Invalid ID or insufficient security clearance",
            variant: "destructive",
          })
          return
        }
      } else if (loginType === "coo") {
        if (!validateCooCode(cooCode)) {
          ciaSecurityLog.failedAttempts++
          toast({
            title: "ACCESS DENIED",
            description: "Invalid COO security code format",
            variant: "destructive",
          })
          return
        }
        // Find COO user
        user = users.find((u) => u.role === "COO")
        if (!user) {
          toast({
            title: "ACCESS DENIED",
            description: "COO account verification failed",
            variant: "destructive",
          })
          return
        }
      } else {
        user = users.find((u) => u.username === username && u.password === password)
        if (!user || !["CEO", "CFO", "COO", "HR", "MANAGER"].includes(user.role)) {
          ciaSecurityLog.failedAttempts++
          ciaSecurityLog.securityBreaches.push({
            type: "unauthorized_credential_access",
            username: username,
            timestamp: new Date().toISOString(),
            threat_level: "HIGH",
          })

          toast({
            title: "ACCESS DENIED",
            description: "Invalid credentials or insufficient security clearance",
            variant: "destructive",
          })
          return
        }
      }

      // Reset security counters on successful login
      ciaSecurityLog.failedAttempts = 0
      setSecurityLevel("DEFCON 5")

      // Store enhanced CIA session
      const ciaSessionData = {
        ...user,
        loginTime: new Date().toISOString(),
        sessionId: `CIA-${Date.now()}`,
        clearanceLevel: user.clearanceLevel,
        accessType: loginType,
      }

      localStorage.setItem("ciaUser", JSON.stringify(ciaSessionData))
      localStorage.setItem("ciaLastSync", new Date().toISOString())

      // Log successful CIA access
      const ciaAccessLog = JSON.parse(localStorage.getItem("ciaAccessHistory") || "[]")
      ciaAccessLog.push({
        userId: user.id,
        name: user.name,
        role: user.role,
        clearanceLevel: user.clearanceLevel,
        timestamp: new Date().toISOString(),
        accessType: loginType,
        sessionId: ciaSessionData.sessionId,
      })
      localStorage.setItem("ciaAccessHistory", JSON.stringify(ciaAccessLog.slice(-25)))

      toast({
        title: "ACCESS GRANTED",
        description: `CIA Portal access authorized for ${user.name}`,
      })

      // Redirect to CIA dashboard
      router.push("/cia-portal/dashboard")
    } catch (error) {
      ciaSecurityLog.securityBreaches.push({
        type: "system_error",
        error: error,
        timestamp: new Date().toISOString(),
        threat_level: "MEDIUM",
      })

      toast({
        title: "SYSTEM ERROR",
        description: "Critical system error during authentication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url(/placeholder.svg?height=1080&width=1920)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-red-900/30"></div>

      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-red-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <img src="/venturica-logo.png" alt="Venturica Staff Logo" className="h-12 w-12 object-contain mr-2" />
            <Shield className="h-8 w-8 text-red-600 mr-2" />
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">CIA PORTAL</CardTitle>
          <CardDescription className="text-red-600">CLASSIFIED ACCESS - AUTHORIZED PERSONNEL ONLY</CardDescription>

          <Alert className="mt-4 border-red-300 bg-red-50">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              Security Level: {securityLevel} | All access attempts are monitored and logged
            </AlertDescription>
          </Alert>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="id" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="id">ID Code</TabsTrigger>
              <TabsTrigger value="coo">COO Code</TabsTrigger>
              <TabsTrigger value="credentials">Login</TabsTrigger>
            </TabsList>

            <TabsContent value="id" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idCode">10-Character ID Code</Label>
                <Input
                  id="idCode"
                  placeholder="Enter authorized ID code"
                  value={idCode}
                  onChange={(e) => setIdCode(e.target.value)}
                  maxLength={10}
                  className="border-red-200 focus:border-red-400 font-mono"
                />
                <p className="text-xs text-red-600">High-security clearance required</p>
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => handleLogin("id")}
                disabled={isLoading || idCode.length !== 10}
              >
                {isLoading ? "AUTHENTICATING..." : "ACCESS PORTAL"}
              </Button>
            </TabsContent>

            <TabsContent value="coo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cooCode">COO Special Access Code</Label>
                <Input
                  id="cooCode"
                  placeholder="3-digit code (2,3,4 only)"
                  value={cooCode}
                  onChange={(e) => setCooCode(e.target.value.replace(/[^234]/g, ""))}
                  maxLength={3}
                  className="border-red-200 focus:border-red-400 font-mono text-center text-lg"
                />
                <p className="text-xs text-red-600">Executive override protocol - digits 2, 3, 4 only</p>
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => handleLogin("coo")}
                disabled={isLoading || !validateCooCode(cooCode)}
              >
                {isLoading ? "AUTHENTICATING..." : "COO OVERRIDE ACCESS"}
              </Button>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => handleLogin("credentials")}
                disabled={isLoading || !username || !password}
              >
                {isLoading ? "AUTHENTICATING..." : "SECURE LOGIN"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-red-200">
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              onClick={() => router.push("/")}
            >
              Return to Staff Portal
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-red-600 flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              CLASSIFIED SYSTEM - UNAUTHORIZED ACCESS IS A FEDERAL CRIME
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
