"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

// Enhanced user database with new ID numbers
const users = [
  {
    id: "2002211235",
    username: "niko20",
    password: "Nikoceo25",
    role: "CEO",
    name: "Niko",
    department: "Executive",
    status: "active",
  },
  {
    id: "9205738837",
    username: "Carlyle20",
    password: "Carlylecfo00",
    role: "CFO",
    name: "Carlyle",
    department: "Finance",
    status: "active",
  },
  {
    id: "7362547590",
    username: "Hanna20",
    password: "Hannacoo10",
    role: "COO",
    name: "Hanna",
    department: "Operations",
    status: "active",
  },
  {
    id: "LYAN123456",
    username: "Lyani",
    password: "Lyanihr29",
    role: "HR",
    name: "Lyani",
    department: "Human Resources",
    status: "active",
  },
  {
    id: "STAFF12345",
    username: "john_doe",
    password: "password123",
    role: "STAFF",
    name: "John Doe",
    department: "Operations",
    status: "active",
  },
  {
    id: "MGMT123456",
    username: "jane_smith",
    password: "manager123",
    role: "MANAGER",
    name: "Jane Smith",
    department: "Management",
    status: "active",
  },
]

// Security monitoring
const securityLog = {
  failedAttempts: 0,
  lastAttempt: null as Date | null,
  blockedIPs: [] as string[],
  suspiciousActivity: [] as any[],
}

export default function LoginPage() {
  const [idCode, setIdCode] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [securityAlert, setSecurityAlert] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Firewall protection
  const checkSecurity = () => {
    const now = new Date()

    // Check for rapid login attempts (basic rate limiting)
    if (securityLog.lastAttempt && now.getTime() - securityLog.lastAttempt.getTime() < 1000) {
      securityLog.failedAttempts++
      if (securityLog.failedAttempts > 3) {
        setSecurityAlert(true)
        toast({
          title: "Security Alert",
          description: "Too many rapid login attempts. Please wait before trying again.",
          variant: "destructive",
        })
        return false
      }
    }

    securityLog.lastAttempt = now
    return true
  }

  // Enhanced login with security checks
  const handleLogin = async (loginType: "id" | "credentials") => {
    if (!checkSecurity()) return

    setIsLoading(true)
    setSecurityAlert(false)

    try {
      let user = null

      if (loginType === "id") {
        user = users.find((u) => u.id === idCode && u.status === "active")
        if (!user) {
          securityLog.failedAttempts++
          securityLog.suspiciousActivity.push({
            type: "invalid_id",
            attempt: idCode,
            timestamp: new Date(),
            ip: "unknown", // In real app, would get actual IP
          })

          toast({
            title: "Login Failed",
            description: "Invalid ID code or account inactive",
            variant: "destructive",
          })
          return
        }
      } else {
        user = users.find((u) => u.username === username && u.password === password && u.status === "active")
        if (!user) {
          securityLog.failedAttempts++
          securityLog.suspiciousActivity.push({
            type: "invalid_credentials",
            username: username,
            timestamp: new Date(),
            ip: "unknown",
          })

          toast({
            title: "Login Failed",
            description: "Invalid username/password or account inactive",
            variant: "destructive",
          })
          return
        }
      }

      // Reset security counters on successful login
      securityLog.failedAttempts = 0

      // Store user session with timestamp for sync
      const sessionData = {
        ...user,
        loginTime: new Date().toISOString(),
        sessionId: Date.now().toString(),
      }

      localStorage.setItem("currentUser", JSON.stringify(sessionData))
      localStorage.setItem("lastSync", new Date().toISOString())

      // Log successful login
      const loginLog = JSON.parse(localStorage.getItem("loginHistory") || "[]")
      loginLog.push({
        userId: user.id,
        name: user.name,
        role: user.role,
        timestamp: new Date().toISOString(),
        type: loginType,
      })
      localStorage.setItem("loginHistory", JSON.stringify(loginLog.slice(-50))) // Keep last 50 logins

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}! Session secured.`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "System Error",
        description: "An error occurred during login. Please try again.",
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
      <div className="absolute inset-0 bg-blue-900/20"></div>

      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/venturica-logo.png" alt="Venturica Staff Logo" className="h-20 w-20 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Staff Portal</CardTitle>
          <CardDescription>Secure Access Dashboard</CardDescription>

          {securityAlert && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                Security protocols active. Multiple failed attempts detected.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="id" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="id">ID Code</TabsTrigger>
              <TabsTrigger value="credentials">Username</TabsTrigger>
            </TabsList>

            <TabsContent value="id" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idCode">10-Character ID Code</Label>
                <Input
                  id="idCode"
                  placeholder="Enter your ID code"
                  value={idCode}
                  onChange={(e) => setIdCode(e.target.value)}
                  maxLength={10}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">Enter your assigned 10-digit ID number</p>
              </div>
              <Button
                className="w-full"
                onClick={() => handleLogin("id")}
                disabled={isLoading || idCode.length !== 10 || securityAlert}
              >
                {isLoading ? "Authenticating..." : "Secure Login with ID"}
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
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleLogin("credentials")}
                disabled={isLoading || !username || !password || securityAlert}
              >
                {isLoading ? "Authenticating..." : "Secure Login"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/cia-portal")}>
              <Shield className="h-4 w-4 mr-2" />
              CIA Investigation Portal
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              Protected by Venturica Security Systems
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
