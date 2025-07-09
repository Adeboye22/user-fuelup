"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import useOrderStore from "@/stores/useOrderStore"

const OrderHistory = () => {
  // States
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)
  const [allOrders, setAllOrders] = useState([])

  // Get orders data from store
  const { orders, ordersPagination, loading, error, fetchOrders, getOrderById } = useOrderStore()

  // Fetch all orders on component mount
  useEffect(() => {
    const fetchAllOrders = async () => {
      // Fetch first page to get total count
      await fetchOrders("/orders/user?page=1&limit=100") // Fetch more orders per page

      // If there are more pages, we might need to fetch them too
      // For now, let's assume 100 orders per request is sufficient
      // You can implement recursive fetching if needed
    }

    fetchAllOrders()
  }, [fetchOrders])

  // Update allOrders when orders change
  useEffect(() => {
    if (orders) {
      setAllOrders(orders)
    }
  }, [orders])

  // Filter orders based on search term and status
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems?.some((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "All" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate pagination for filtered results
  const totalFilteredOrders = filteredOrders.length
  const totalPages = Math.ceil(totalFilteredOrders / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Get status style - updated to include 'initiated' status
  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
      case "paid":
        return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
      case "pending":
      case "processing":
        return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
      case "initiated":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
    }
  }

  // Format status for display
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Create pagination info for filtered results
  const paginationInfo = {
    currentPage: currentPage,
    totalPages: totalPages,
    totalCount: totalFilteredOrders,
    pageSize: pageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }

  // Mobile Card Component
  const OrderCard = ({ order }) => (
    <Card className="mb-3 border-gray-200 dark:border-gray-700/50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">#{order._id.slice(-6).toUpperCase()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(order.createdAt)}</p>
          </div>
          <Badge variant="outline" className={getStatusStyle(order.status)}>
            {formatStatus(order.status)}
          </Badge>
        </div>
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Items</p>
          <p className="text-gray-800 dark:text-white">
            {order.orderItems?.length > 0
              ? `${order.orderItems[0].productName} ${
                  order.orderItems.length > 1 ? `+ ${order.orderItems.length - 1} more` : ""
                }`
              : "No items"}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="font-semibold text-gray-800 dark:text-white">₦{order.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[50rem] md:max-w-full"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h1>
        {/* Show filter summary */}
        {(searchTerm || statusFilter !== "All") && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Showing {totalFilteredOrders} of {allOrders.length} orders
            {statusFilter !== "All" && ` with status "${formatStatus(statusFilter)}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        )}
      </div>
      <Card className="border-gray-200 dark:border-gray-700/50 gap-0 shadow-sm px-0">
        <CardHeader className="pb-2 px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search orders or products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-800"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-gray-500">
                <Filter size={16} />
                {statusFilter !== "All" && (
                  <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-2 h-2"></span>
                )}
              </Button>
            </div>
          </div>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="initiated">Initiated</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || statusFilter !== "All") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("All")
                    }}
                    className="w-full sm:w-auto"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="px-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">{error}</div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block md:hidden">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => <OrderCard key={order._id} order={order} />)
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {searchTerm || statusFilter !== "All" ? "No orders match your filters" : "No orders found"}
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-500 dark:text-gray-400">Order ID</TableHead>
                        <TableHead className="text-gray-500 dark:text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-500 dark:text-gray-400">Items</TableHead>
                        <TableHead className="text-gray-500 dark:text-gray-400">Status</TableHead>
                        <TableHead className="text-right text-gray-500 dark:text-gray-400">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order) => (
                          <TableRow key={order._id} className="border-t border-gray-200 dark:border-gray-700/30">
                            <TableCell className="font-medium text-gray-800 dark:text-white">
                              #{order._id.slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell className="text-gray-800 dark:text-white">
                              {order.orderItems?.length > 0
                                ? `${order.orderItems[0].productName} ${
                                    order.orderItems.length > 1 ? `+ ${order.orderItems.length - 1} more` : ""
                                  }`
                                : "No items"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusStyle(order.status)}>
                                {formatStatus(order.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-gray-800 dark:text-white">
                              ₦{order.totalAmount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            {searchTerm || statusFilter !== "All" ? "No orders match your filters" : "No orders found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
          {!loading && paginationInfo.totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (paginationInfo.hasPreviousPage) {
                        handlePageChange(paginationInfo.currentPage - 1)
                      }
                    }}
                    className={!paginationInfo.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(paginationInfo.totalPages, 5) }).map((_, i) => {
                  // Show pages around current page
                  let pageNumber
                  if (paginationInfo.totalPages <= 5) {
                    pageNumber = i + 1
                  } else {
                    const start = Math.max(1, paginationInfo.currentPage - 2)
                    const end = Math.min(paginationInfo.totalPages, start + 4)
                    pageNumber = start + i
                    if (pageNumber > end) return null
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(pageNumber)
                        }}
                        isActive={paginationInfo.currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (paginationInfo.hasNextPage) {
                        handlePageChange(paginationInfo.currentPage + 1)
                      }
                    }}
                    className={!paginationInfo.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default OrderHistory
