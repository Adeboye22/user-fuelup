"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Send, MessageSquare, User, Clock, CheckCircle, X } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import apiService from "@/lib/api"
import { useTheme } from "@/components/theme-provider"
import { toast } from "react-hot-toast"
import useAuthStore from "@/stores/useAuthStore"

const TicketDetail = () => {
  const { ticketId } = useParams()
  const { theme } = useTheme()
  const { user } = useAuthStore()
  const isLightMode = theme === "light"

  const [ticket, setTicket] = useState(null)
  const [replies, setReplies] = useState([])
  const [newReply, setNewReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [replyLoading, setReplyLoading] = useState(false)
  const [closingTicket, setClosingTicket] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  const fetchTicketDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch ticket details - using the user endpoint to get their specific ticket
      const response = await apiService.get(`/support/tickets/${ticketId}`)

      if (response.status === "success") {
        setTicket(response.data)
        // If the API returns replies in the ticket object, use them
        // Otherwise, you might need a separate endpoint for replies
        setReplies(response.data.replies || [])
      } else {
        setError("Ticket not found")
      }
    } catch (err) {
      console.error("Error fetching ticket:", err)
      setError(err.response?.data?.message || "Failed to load ticket")
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()

    if (!newReply.trim()) {
      toast.error("Please enter a reply")
      return
    }

    try {
      setReplyLoading(true)

      const response = await apiService.post(`/support/tickets/${ticketId}/reply`, {
        message: newReply.trim(),
      })

      if (response.status === "success") {
        // Add the new reply to the list
        const newReplyObj = {
          id: Date.now().toString(), // Temporary ID
          message: newReply.trim(),
          sender: "user",
          senderName: user?.firstName || "You",
          createdAt: new Date().toISOString(),
        }

        setReplies((prev) => [...prev, newReplyObj])
        setNewReply("")
        toast.success("Reply sent successfully!")

        // Refresh ticket details to get updated status
        fetchTicketDetails()
      }
    } catch (err) {
      console.error("Error sending reply:", err)
      toast.error(err.response?.data?.message || "Failed to send reply")
    } finally {
      setReplyLoading(false)
    }
  }

  const handleCloseTicket = async () => {
    try {
      setClosingTicket(true)

      const response = await apiService.patch(`/support/tickets/${ticketId}/close`)

      if (response.status === "success") {
        setTicket((prev) => ({ ...prev, status: "CLOSED" }))
        toast.success("Ticket closed successfully!")
      }
    } catch (err) {
      console.error("Error closing ticket:", err)
      toast.error(err.response?.data?.message || "Failed to close ticket")
    } finally {
      setClosingTicket(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
      case "CLOSED":
        return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
      case "RESOLVED":
        return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
      default:
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
    }
  }

  const styles = {
    cardContainer: isLightMode
      ? "bg-white backdrop-blur-md border border-gray-300 shadow-lg"
      : "bg-gray-800/40 backdrop-blur-md border border-gray-700/50 shadow-lg",
    messageUser: isLightMode ? "bg-emerald-50 border-emerald-200" : "bg-emerald-900/20 border-emerald-700/50",
    messageAdmin: isLightMode ? "bg-blue-50 border-blue-200" : "bg-blue-900/20 border-blue-700/50",
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={styles.cardContainer}>
        <CardContent className="p-8 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link to="/dashboard/support">
            <Button variant="outline">Back to Tickets</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/support">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
        </div>

        {ticket?.status === "OPEN" && (
          <Button
            onClick={handleCloseTicket}
            disabled={closingTicket}
            variant="outline"
            className="text-gray-600 hover:text-gray-800 bg-transparent"
          >
            {closingTicket ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Closing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Close Ticket
              </>
            )}
          </Button>
        )}
      </div>

      {/* Ticket Header */}
      <Card className={styles.cardContainer}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">#{ticket.id.slice(-6).toUpperCase()}</span>
              </div>
              <CardTitle className="text-xl text-gray-800 dark:text-white">Support Request</CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Created: {formatDate(ticket.createdAt)}</span>
            <span>Updated: {formatDate(ticket.updatedAt)}</span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{ticket.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card className={styles.cardContainer}>
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No replies yet. Our support team will respond soon.</p>
            </div>
          ) : (
            replies.map((reply, index) => (
              <div
                key={reply.id || index}
                className={`border rounded-lg p-4 ${
                  reply.sender === "user" ? styles.messageUser : styles.messageAdmin
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={reply.sender === "user" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}
                    >
                      {reply.sender === "user" ? <User className="w-4 h-4" /> : "S"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {reply.sender === "user" ? "You" : "Support Team"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {ticket?.status === "OPEN" && (
        <Card className={styles.cardContainer}>
          <CardHeader>
            <CardTitle className="text-lg text-gray-800 dark:text-white">Add Reply</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <Textarea
                placeholder="Type your reply here..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="min-h-24"
                maxLength={1000}
              />

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">{newReply.length}/1000</span>

                <Button
                  type="submit"
                  disabled={replyLoading || !newReply.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {replyLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {ticket?.status !== "OPEN" && (
        <Card className={styles.cardContainer}>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              This ticket is {ticket.status.toLowerCase()}. You cannot add new replies.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

export default TicketDetail
