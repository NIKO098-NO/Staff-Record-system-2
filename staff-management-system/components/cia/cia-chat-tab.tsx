"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Shield, Lock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  username: string
  role: string
  name: string
}

interface SecureMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  timestamp: string
  channel: string
  classification: "confidential" | "restricted" | "top-secret"
  encrypted: boolean
}

interface CIAChatTabProps {
  user: User
}

export function CIAChatTab({ user }: CIAChatTabProps) {
  const [messages, setMessages] = useState<SecureMessage[]>([
    {
      id: "1",
      senderId: "NIKO123456",
      senderName: "Niko",
      senderRole: "CEO",
      content: "Investigation update: Security breach has been contained. All access logs reviewed.",
      timestamp: "2024-01-15T14:30:00",
      channel: "executive",
      classification: "confidential",
      encrypted: true,
    },
    {
      id: "2",
      senderId: "HANN123456",
      senderName: "Hanna",
      senderRole: "COO",
      content: "Lockdown protocols tested successfully. All systems operational.",
      timestamp: "2024-01-15T14:35:00",
      channel: "executive",
      classification: "restricted",
      encrypted: true,
    },
    {
      id: "3",
      senderId: "CARL123456",
      senderName: "Carlyle",
      senderRole: "CFO",
      content: "Financial audit complete. No irregularities detected in recent transactions.",
      timestamp: "2024-01-15T14:40:00",
      channel: "executive",
      classification: "confidential",
      encrypted: true,
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [activeChannel, setActiveChannel] = useState("executive")
  const [classification, setClassification] = useState<"confidential" | "restricted" | "top-secret">("confidential")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const channels = [
    {
      id: "executive",
      name: "Executive",
      description: "CEO, CFO, COO only",
      requiredRoles: ["CEO", "CFO", "COO"],
      icon: Shield,
    },
    {
      id: "investigation",
      name: "Investigation",
      description: "Active investigation discussions",
      requiredRoles: ["CEO", "CFO", "COO", "MANAGER", "HR"],
      icon: AlertTriangle,
    },
    {
      id: "security",
      name: "Security",
      description: "Security-related communications",
      requiredRoles: ["CEO", "CFO", "COO", "MANAGER"],
      icon: Lock,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const canAccessChannel = (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId)
    return channel?.requiredRoles.includes(user.role) || false
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    if (!canAccessChannel(activeChannel)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to send messages in this channel",
        variant: "destructive",
      })
      return
    }

    const message: SecureMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: newMessage,
      timestamp: new Date().toISOString(),
      channel: activeChannel,
      classification: classification,
      encrypted: true,
    }

    setMessages([...messages, message])
    setNewMessage("")

    toast({
      title: "Secure Message Sent",
      description: "Your encrypted message has been delivered",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredMessages = messages.filter((msg) => msg.channel === activeChannel)

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "CEO":
        return "bg-purple-100 text-purple-800"
      case "CFO":
        return "bg-blue-100 text-blue-800"
      case "COO":
        return "bg-green-100 text-green-800"
      case "MANAGER":
        return "bg-orange-100 text-orange-800"
      case "HR":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "top-secret":
        return "bg-red-100 text-red-800 border-red-300"
      case "confidential":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "restricted":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const activeChannelData = channels.find((c) => c.id === activeChannel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Secure Communications</h2>
        <p className="text-gray-400">Encrypted channels for authorized personnel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Channels Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                <Shield className="h-5 w-5" />
                <span>Secure Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {channels.map((channel) => {
                const hasAccess = canAccessChannel(channel.id)
                const IconComponent = channel.icon

                return (
                  <Button
                    key={channel.id}
                    variant={activeChannel === channel.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      hasAccess
                        ? activeChannel === channel.id
                          ? "bg-red-600 hover:bg-red-700"
                          : "text-gray-300 hover:bg-gray-700"
                        : "text-gray-500 cursor-not-allowed opacity-50"
                    }`}
                    onClick={() => hasAccess && setActiveChannel(channel.id)}
                    disabled={!hasAccess}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div>{channel.name}</div>
                      <div className="text-xs opacity-75">{channel.description}</div>
                    </div>
                    {!hasAccess && <Lock className="h-3 w-3 ml-auto" />}
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Online Users */}
          <Card className="mt-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-100">Authorized Personnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-purple-600 text-white">N</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300">Niko (CEO)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-blue-600 text-white">C</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300">Carlyle (CFO)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-green-600 text-white">H</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300">Hanna (COO)</span>
              </div>
              {user.role === "HR" || user.role === "MANAGER" ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-gray-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-300">You ({user.role})</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                {activeChannelData && <activeChannelData.icon className="h-5 w-5" />}
                <span>#{activeChannelData?.name}</span>
                <Badge variant="destructive" className="bg-red-600">
                  ENCRYPTED
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {activeChannelData?.description} • End-to-end encrypted
              </CardDescription>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
              {canAccessChannel(activeChannel) ? (
                <>
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={`text-xs ${
                            message.senderRole === "CEO"
                              ? "bg-purple-600"
                              : message.senderRole === "CFO"
                                ? "bg-blue-600"
                                : message.senderRole === "COO"
                                  ? "bg-green-600"
                                  : "bg-gray-600"
                          } text-white`}
                        >
                          {message.senderName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-200">{message.senderName}</span>
                          <Badge className={`text-xs ${getRoleColor(message.senderRole)}`}>{message.senderRole}</Badge>
                          <Badge className={`text-xs ${getClassificationColor(message.classification)}`}>
                            {message.classification.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          {message.encrypted && <Lock className="h-3 w-3 text-green-400" />}
                        </div>
                        <p className="text-sm text-gray-300">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-100 mb-2">Access Restricted</h3>
                    <p className="text-gray-400">You don't have permission to view this channel.</p>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Message Input */}
            {canAccessChannel(activeChannel) && (
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-gray-400">Classification:</span>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as any)}
                    className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200"
                  >
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                    <option value="top-secret">Top Secret</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder={`Secure message to #${activeChannelData?.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-gray-700 border-gray-600 text-gray-100"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Messages are end-to-end encrypted and logged for security purposes
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
