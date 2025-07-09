"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, Search } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import apiService from "@/lib/api"
import { useTheme } from "@/components/theme-provider"

const SupportDashboard = () => {
  const { theme } = useTheme()
  const isLightMode = theme === "light"

  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => {
    fetchTickets()
    fetchCategories()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      // Using the user-facing endpoint from your API documentation
      const response = await apiService.get("/support/tickets")

      if (response.status === "success") {
        setTickets(response.data || [])
      } else {
        setError("Failed to fetch tickets")
      }
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setError(err.response?.data?.message || "Failed to fetch tickets")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiService.get("/support/categories")
      if (response.status === "success") {
        setCategories(response.data || [])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <Clock className="w-4 h-4" />
      case "CLOSED":
        return <CheckCircle className="w-4 h-4" />
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || "General"
  }

  const styles = {
    cardContainer: isLightMode
      ? "bg-white backdrop-blur-md border border-gray-300 shadow-lg"
      : "bg-gray-800/40 backdrop-blur-md border border-gray-700/50 shadow-lg",
    ticketCard: isLightMode
      ? "bg-white border-gray-200 hover:bg-gray-50"
      : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Support Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your support requests and get help from our team
          </p>
        </div>
        <Link to="/dashboard/support/create">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className={styles.cardContainer}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <Card className={styles.cardContainer}>
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={fetchTickets} variant="outline" className="mt-4 bg-transparent">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card className={styles.cardContainer}>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                {tickets.length === 0 ? "No tickets yet" : "No tickets match your search"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {tickets.length === 0
                  ? "Create your first support ticket to get help from our team"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {tickets.length === 0 && (
                <Link to="/dashboard/support/create">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ticket
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className={`${styles.ticketCard} transition-colors cursor-pointer`}>
              <Link to={`/dashboard/support/ticket/${ticket.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          #{ticket.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        {getCategoryName(ticket.category)} - Support Request
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{ticket.message}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {formatDate(ticket.createdAt)}</span>
                        <span>Updated: {formatDate(ticket.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default SupportDashboard
