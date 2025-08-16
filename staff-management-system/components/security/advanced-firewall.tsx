"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Zap, Bot, Lock, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ThreatDetection {
  id: string
  type: "brute_force" | "sql_injection" | "ddos" | "malware" | "unauthorized_access"
  severity: "low" | "medium" | "high" | "critical"
  source: string
  timestamp: string
  status: "detected" | "blocked" | "neutralized"
  botResponse: string
}

interface FirewallLayer {
  name: string
  status: "active" | "inactive"
  threats_blocked: number
  last_update: string
}

export function AdvancedFirewall() {
  const [threats, setThreats] = useState<ThreatDetection[]>([])
  const [firewallLayers, setFirewallLayers] = useState<FirewallLayer[]>([
    { name: "Deep Packet Inspection", status: "active", threats_blocked: 1247, last_update: "2024-01-15 14:30" },
    { name: "Behavioral Analysis", status: "active", threats_blocked: 892, last_update: "2024-01-15 14:29" },
    { name: "AI Threat Detection", status: "active", threats_blocked: 2156, last_update: "2024-01-15 14:31" },
    { name: "Zero-Day Protection", status: "active", threats_blocked: 45, last_update: "2024-01-15 14:28" },
    { name: "Bot Defense System", status: "active", threats_blocked: 3421, last_update: "2024-01-15 14:32" },
  ])
  const [botSystemActive, setBotSystemActive] = useState(true)
  const [autoDefenseMode, setAutoDefenseMode] = useState(true)
  const { toast } = useToast()

  // Simulate real-time threat detection
  useEffect(() => {
    const threatSimulation = setInterval(() => {
      if (Math.random() < 0.3) {
        // 30% chance of detecting a threat
        const threatTypes = ["brute_force", "sql_injection", "ddos", "malware", "unauthorized_access"] as const
        const severities = ["low", "medium", "high", "critical"] as const

        const newThreat: ThreatDetection = {
          id: Date.now().toString(),
          type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          timestamp: new Date().toISOString(),
          status: "detected",
          botResponse: "Analyzing threat pattern...",
        }

        setThreats((prev) => [newThreat, ...prev.slice(0, 9)]) // Keep last 10 threats

        // Auto-neutralize threat
        setTimeout(() => {
          setThreats((prev) =>
            prev.map((threat) =>
              threat.id === newThreat.id
                ? { ...threat, status: "neutralized", botResponse: "Threat neutralized by AI defense system" }
                : threat,
            ),
          )

          // Update firewall layer stats
          setFirewallLayers((prev) =>
            prev.map((layer) => ({
              ...layer,
              threats_blocked: layer.threats_blocked + 1,
              last_update: new Date().toLocaleString(),
            })),
          )
        }, 2000)
      }
    }, 5000)

    return () => clearInterval(threatSimulation)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "detected":
        return "bg-yellow-100 text-yellow-800"
      case "blocked":
        return "bg-orange-100 text-orange-800"
      case "neutralized":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Firewall Status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Shield className="h-6 w-6" />
            <span>Advanced Firewall System</span>
            <Badge className="bg-green-600 text-white">PERMANENTLY ACTIVE</Badge>
          </CardTitle>
          <CardDescription className="text-green-700">
            Multi-layered protection with AI-powered threat detection and automated response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-green-700">Protection Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {firewallLayers.reduce((sum, layer) => sum + layer.threats_blocked, 0)}
              </div>
              <p className="text-sm text-green-700">Threats Blocked Today</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">5</div>
              <p className="text-sm text-green-700">Active Defense Layers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defense Layers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Defense Layers</span>
          </CardTitle>
          <CardDescription>Multi-layered security architecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {firewallLayers.map((layer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <h4 className="font-medium">{layer.name}</h4>
                    <p className="text-sm text-gray-600">Last update: {layer.last_update}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-600 text-white">ACTIVE</Badge>
                  <p className="text-sm text-gray-600 mt-1">{layer.threats_blocked} blocked</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bot Defense System */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Bot className="h-6 w-6" />
            <span>AI Bot Defense System</span>
            <Badge className={botSystemActive ? "bg-blue-600 text-white" : "bg-gray-600"}>
              {botSystemActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Automated AI bots actively hunt and neutralize threats in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Bot Capabilities</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real-time threat hunting</li>
                <li>• Automated response protocols</li>
                <li>• Machine learning adaptation</li>
                <li>• Zero-day exploit detection</li>
                <li>• Behavioral anomaly analysis</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Current Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Active Bots:</span>
                  <span className="font-mono">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Threats Neutralized:</span>
                  <span className="font-mono">3,421</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-mono">0.003s</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Threat Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Real-time Threat Monitor</span>
          </CardTitle>
          <CardDescription>Live threat detection and response</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {threats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No threats detected. System secure.</p>
              </div>
            ) : (
              threats.map((threat) => (
                <div key={threat.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 ${
                        threat.severity === "critical"
                          ? "text-red-500"
                          : threat.severity === "high"
                            ? "text-orange-500"
                            : threat.severity === "medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                      }`}
                    />
                    <div>
                      <h4 className="font-medium capitalize">{threat.type.replace("_", " ")}</h4>
                      <p className="text-sm text-gray-600">Source: {threat.source}</p>
                      <p className="text-sm text-gray-600">{threat.botResponse}</p>
                      <p className="text-xs text-gray-500">{new Date(threat.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getSeverityColor(threat.severity)}>{threat.severity.toUpperCase()}</Badge>
                    <Badge className={getStatusColor(threat.status)}>{threat.status.toUpperCase()}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>System Controls</span>
          </CardTitle>
          <CardDescription>Advanced security configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Auto-Defense Mode</h4>
              <p className="text-sm text-gray-600 mb-3">Automatically neutralize detected threats</p>
              <Badge className={autoDefenseMode ? "bg-green-600" : "bg-gray-600"}>
                {autoDefenseMode ? "ENABLED" : "DISABLED"}
              </Badge>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Firewall Status</h4>
              <p className="text-sm text-gray-600 mb-3">Permanent protection - cannot be disabled</p>
              <Badge className="bg-green-600">PERMANENTLY ACTIVE</Badge>
            </div>
          </div>

          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-800">Security Notice</h4>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Firewall protection is permanently enabled and cannot be deactivated. This ensures continuous security
              coverage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
