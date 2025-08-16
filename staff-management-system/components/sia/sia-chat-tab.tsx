"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, MessageSquare, Users, Shield, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  username: string
  role: string
  name: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  timestamp: string
  channel: string
}

interface SIAChatTabProps {
  user: User
}

export function SIAChatTab({ user }: SIAChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([])

  const [newMessage, setNewMessage] = useState("")
  const [activeChannel, setActiveChannel] = useState("secure-general")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const channels = [
    { id: "secure-general", name: "Secure General", description: "Encrypted general discussion" },
    { id: "threat-intel", name: "Threat Intel", description: "Threat intelligence sharing" },
    { id: "operations", name: "Operations", description: "Secure operational discussions" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: newMessage,
      timestamp: new Date().toISOString(),
      channel: activeChannel,
    }

    setMessages([...messages, message])
    setNewMessage("")

    toast({
      title: "Secure Message Sent",
      description: "Your encrypted message has been sent",
    })
  }

  const handleDeleteAllSecureChats = () => {
    if (deleteCode !== "Con=20=delete") {
      toast({
        title: "Delete Cancelled",
        description: "Invalid security code. Secure chat deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    setMessages([])
    localStorage.removeItem("secureChatMessages")
    setShowDeleteDialog(false)
    setDeleteCode("")

    toast({
      title: "All Secure Chats Deleted",
      description: "All secure chat messages have been permanently removed",
      variant: "destructive",
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
      case "SIA_AGENT":
        return "bg-red-100 text-red-800"
      case "SIA_ANALYST":
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
          <h2 className="text-2xl font-bold text-gray-100">Secure Chat</h2>
          <p className="text-gray-400">Encrypted communication for SIA personnel</p>
        </div>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All Secure Chats
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Channels Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                <Users className="h-5 w-5 text-blue-400" />
                <span>Secure Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannel === channel.id ? "default" : "ghost"}
                  className={`w-full justify-start ${activeChannel === channel.id ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-300 hover:bg-gray-700"}`}
                  onClick={() => setActiveChannel(channel.id)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {channel.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Online Users */}
          <Card className="mt-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-100">Online Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300">You</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-100">
                <Shield className="h-5 w-5 text-blue-400" />
                <span>#{channels.find((c) => c.id === activeChannel)?.name}</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {channels.find((c) => c.id === activeChannel)?.description}
              </CardDescription>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                  <p>No secure messages yet. Start an encrypted conversation!</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-100">{message.senderName}</span>
                        <Badge className={`text-xs ${getRoleColor(message.senderRole)}`}>{message.senderRole}</Badge>
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-300">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Input
                  placeholder={`Message #${channels.find((c) => c.id === activeChannel)?.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-gray-700 border-gray-600 text-gray-100"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Secure Chat Messages</DialogTitle>
            <DialogDescription>
              This will permanently delete all secure chat messages from all channels. This action cannot be undone.
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
            <Button type="submit" variant="destructive" onClick={handleDeleteAllSecureChats}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
