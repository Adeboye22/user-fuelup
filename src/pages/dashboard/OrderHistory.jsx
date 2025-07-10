"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Eye, X, MapPin, Fuel, Calendar, DollarSign, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import toast from "react-hot-toast"
import useOrderStore from "@/stores/useOrderStore"
import { Separator } from "@/components/ui/separator"

const OrderHistory = () => {
  // States
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)
  const [allOrders, setAllOrders] = useState([])
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const [cancellationReason, setCancellationReason] = useState("")

  // Get orders data from store
  const { orders, ordersPagination, loading, error, fetchOrders, getOrderById, cancelOrder } = useOrderStore()

  // Fetch all orders on component mount
  useEffect(() => {
    const fetchAllOrders = async () => {
      await fetchOrders("/orders/user?page=1&limit=100")
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

  // Format detailed date
  const formatDetailedDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get status style
  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
      case "paid":
      case "driver_accepted":
        return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
      case "pending":
      case "processing":
      case "driver_assigned":
      case "out_for_delivery":
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
    const statusMap = {
      initiated: "Order Placed",
      paid: "Payment Confirmed",
      driver_assigned: "Driver Assigned",
      driver_accepted: "Driver Accepted",
      processing: "Being Prepared",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    }
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Format price
  const formatPrice = (amount) => {
    return (amount / 100).toLocaleString()
  }

  // Handle view order details
  const handleViewDetails = async (orderId) => {
    try {
      const order = await getOrderById(orderId)
      setSelectedOrder(order)
      setShowOrderDetails(true)
    } catch (err) {
      toast.error("Failed to load order details")
    }
  }

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return ["initiated", "paid", "driver_assigned"].includes(status)
  }

  // Handle cancel order
  const handleCancelOrder = (order) => {
    setCancellingOrder(order)
    setShowCancelDialog(true)
  }

  // Confirm cancellation
  const confirmCancellation = async () => {
    if (!cancellingOrder || !cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation")
      return
    }

    try {
      const result = await cancelOrder(cancellingOrder._id, {
        reason: cancellationReason,
        cancelledBy: "customer",
      })

      toast.success(`Order cancelled successfully. Refund: ₦${formatPrice(result.refundAmount)}`)

      // Refresh orders
      await fetchOrders("/orders/user?page=1&limit=100")

      // Close dialog and reset state
      setShowCancelDialog(false)
      setCancellingOrder(null)
      setCancellationReason("")
    } catch (err) {
      toast.error(err.message || "Failed to cancel order")
    }
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
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="font-semibold text-gray-800 dark:text-white">₦{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(order._id)}
            className="flex-1 bg-transparent"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          {canCancelOrder(order.status) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancelOrder(order)}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
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
                    <SelectItem value="driver_assigned">Driver Assigned</SelectItem>
                    <SelectItem value="driver_accepted">Driver Accepted</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
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
                        <TableHead className="text-center text-gray-500 dark:text-gray-400">Actions</TableHead>
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
                              ₦{formatPrice(order.totalAmount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(order._id)}
                                  className="bg-transparent"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {canCancelOrder(order.status) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelOrder(order)}
                                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-gray-500">
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

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Order Details - #{selectedOrder?._id.slice(-6).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                  <Badge variant="outline" className={`${getStatusStyle(selectedOrder.status)} text-sm px-3 py-1 mt-1`}>
                    {formatStatus(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                  <p className="font-medium">{formatDetailedDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Fuel Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Fuel className="w-5 h-5 mr-2" />
                  Fuel Details
                </h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.qunatity} liters × ₦{formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₦{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </h3>
                <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-gray-700 dark:text-gray-300">{selectedOrder.orderAddress}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Order Summary
                </h3>
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span>
                      ₦{formatPrice(selectedOrder.orderItems?.reduce((sum, item) => sum + item.price, 0) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service Fee:</span>
                    <span>₦{formatPrice(selectedOrder.serviceFee || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                    <span>₦{formatPrice(selectedOrder.deliveryFee || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-emerald-600">₦{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Order Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDetailedDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDetailedDate(selectedOrder.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {canCancelOrder(selectedOrder.status) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOrderDetails(false)
                      handleCancelOrder(selectedOrder)
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowOrderDetails(false)} className="ml-auto bg-transparent">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Cancel Order</DialogTitle>
          </DialogHeader>

          {cancellingOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Cancel Order #{cancellingOrder._id.slice(-6).toUpperCase()}?
                  </p>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This action cannot be undone. You will receive a refund based on our cancellation policy.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <Select value={cancellationReason} onValueChange={setCancellationReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="changed_mind">Changed my mind</SelectItem>
                    <SelectItem value="wrong_order">Ordered wrong item</SelectItem>
                    <SelectItem value="delivery_delay">Delivery taking too long</SelectItem>
                    <SelectItem value="found_better_price">Found better price elsewhere</SelectItem>
                    <SelectItem value="emergency">Emergency situation</SelectItem>
                    <SelectItem value="other">Other reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelDialog(false)
                    setCancellingOrder(null)
                    setCancellationReason("")
                  }}
                  className="flex-1 bg-transparent"
                >
                  Keep Order
                </Button>
                <Button
                  onClick={confirmCancellation}
                  disabled={!cancellationReason}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default OrderHistory
