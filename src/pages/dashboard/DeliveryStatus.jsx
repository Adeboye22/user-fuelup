"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageCircle,
  Package,
  Navigation,
  Fuel,
  User,
  ArrowLeft,
  AlertTriangle,
  UserCheck,
  Timer,
} from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import useOrderStore from "@/stores/useOrderStore"
import useAuthStore from "@/stores/useAuthStore"

const DeliveryStatus = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()

  // Store hooks
  const { orders, currentOrder, loading, error, fetchOrders, getOrderById } = useOrderStore()
  const { user } = useAuthStore()

  // Local state
  const [searchOrderId, setSearchOrderId] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingHistory, setTrackingHistory] = useState([])
  const [estimatedDelivery, setEstimatedDelivery] = useState(null)
  const [driverInfo, setDriverInfo] = useState(null)

  // Initialize component
  useEffect(() => {
    fetchOrders()

    // If orderId is provided in URL, fetch that specific order
    if (orderId) {
      handleOrderSelect(orderId)
    }

    // If order ID is in search params, use it
    const orderIdFromParams = searchParams.get("orderId")
    if (orderIdFromParams) {
      setSearchOrderId(orderIdFromParams)
      handleOrderSelect(orderIdFromParams)
    }
  }, [orderId, searchParams, fetchOrders])

  // Handle order selection
  const handleOrderSelect = async (orderIdToSelect) => {
    try {
      const order = await getOrderById(orderIdToSelect)
      setSelectedOrder(order)
      generateTrackingHistory(order)
      calculateEstimatedDelivery(order)

      // Mock driver info - show when driver is assigned
      if (
        order.status === "driver_assigned" ||
        order.status === "driver_accepted" ||
        order.status === "processing" ||
        order.status === "out_for_delivery" ||
        order.status === "delivered"
      ) {
        setDriverInfo({
          name: "John Doe",
          phone: "+234 801 234 5678",
          vehicle: "Toyota Hilux - ABC 123 XY",
          rating: 4.8,
          assignedAt: order.updatedAt,
        })
      }
    } catch (err) {
      toast.error("Order not found or you don't have permission to view it")
      setSelectedOrder(null)
    }
  }

  // Generate tracking history with driver acceptance flow
  const generateTrackingHistory = (order) => {
    const history = [
      {
        status: "initiated",
        title: "Order Placed",
        description: "Your fuel order has been received and is being processed",
        timestamp: order.createdAt,
        completed: true,
        icon: <Package className="w-5 h-5" />,
      },
    ]

    if (
      order.status === "paid" ||
      order.status === "driver_assigned" ||
      order.status === "driver_accepted" ||
      order.status === "processing" ||
      order.status === "out_for_delivery" ||
      order.status === "delivered"
    ) {
      history.push({
        status: "paid",
        title: "Payment Confirmed",
        description: "Payment has been successfully processed",
        timestamp: order.updatedAt,
        completed: true,
        icon: <CheckCircle className="w-5 h-5" />,
      })
    }

    // Driver Assignment Step
    if (
      order.status === "driver_assigned" ||
      order.status === "driver_accepted" ||
      order.status === "processing" ||
      order.status === "out_for_delivery" ||
      order.status === "delivered"
    ) {
      history.push({
        status: "driver_assigned",
        title: "Driver Assigned",
        description: "A driver has been assigned to your order",
        timestamp: order.updatedAt,
        completed: true,
        icon: <User className="w-5 h-5" />,
      })
    }

    // Driver Acceptance Step - NEW
    if (
      order.status === "driver_accepted" ||
      order.status === "processing" ||
      order.status === "out_for_delivery" ||
      order.status === "delivered"
    ) {
      history.push({
        status: "driver_accepted",
        title: "Driver Accepted",
        description: "Driver has accepted your order and is preparing for pickup",
        timestamp: order.updatedAt,
        completed: true,
        icon: <UserCheck className="w-5 h-5" />,
      })
    } else if (order.status === "driver_assigned") {
      history.push({
        status: "driver_pending",
        title: "Awaiting Driver Acceptance",
        description: "Waiting for driver to accept the delivery request",
        timestamp: null,
        completed: false,
        current: true,
        icon: <Timer className="w-5 h-5" />,
      })
    }

    // Processing Step
    if (order.status === "processing" || order.status === "out_for_delivery" || order.status === "delivered") {
      history.push({
        status: "processing",
        title: "Preparing for Delivery",
        description: "Your fuel is being prepared and loaded for delivery",
        timestamp: order.updatedAt,
        completed: true,
        icon: <Truck className="w-5 h-5" />,
      })
    }

    // Out for Delivery Step
    if (order.status === "out_for_delivery" || order.status === "delivered") {
      history.push({
        status: "out_for_delivery",
        title: "Out for Delivery",
        description: "Driver is on the way to your location",
        timestamp: order.updatedAt,
        completed: order.status === "delivered",
        current: order.status === "out_for_delivery",
        icon: <Navigation className="w-5 h-5" />,
      })
    } else if (order.status === "processing") {
      history.push({
        status: "out_for_delivery",
        title: "Out for Delivery",
        description: "Driver will be on the way soon",
        timestamp: null,
        completed: false,
        current: false,
        icon: <Navigation className="w-5 h-5" />,
      })
    }

    // Delivered Step
    if (order.status === "delivered") {
      history.push({
        status: "delivered",
        title: "Delivered",
        description: "Your fuel has been successfully delivered",
        timestamp: order.updatedAt,
        completed: true,
        icon: <CheckCircle className="w-5 h-5" />,
      })
    }

    // Cancelled Step
    if (order.status === "cancelled") {
      history.push({
        status: "cancelled",
        title: "Order Cancelled",
        description: "This order has been cancelled",
        timestamp: order.updatedAt,
        completed: true,
        error: true,
        icon: <AlertCircle className="w-5 h-5" />,
      })
    }

    setTrackingHistory(history)
  }

  // Calculate estimated delivery time
  const calculateEstimatedDelivery = (order) => {
    if (order.status === "delivered") {
      setEstimatedDelivery(null)
      return
    }

    // Different estimates based on status
    const now = new Date()
    let estimatedTime

    switch (order.status) {
      case "initiated":
      case "paid":
        estimatedTime = new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours
        break
      case "driver_assigned":
        estimatedTime = new Date(now.getTime() + 3 * 60 * 60 * 1000) // 3 hours
        break
      case "driver_accepted":
      case "processing":
        estimatedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
        break
      case "out_for_delivery":
        estimatedTime = new Date(now.getTime() + 45 * 60 * 1000) // 45 minutes
        break
      default:
        estimatedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    }

    setEstimatedDelivery(estimatedTime)
  }

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
      case "paid":
      case "driver_accepted":
        return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
      case "processing":
      case "out_for_delivery":
      case "driver_assigned":
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Format price
  const formatPrice = (amount) => {
    return (amount / 100).toLocaleString()
  }

  // Get active orders for quick selection
  const activeOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled")

  console.log(activeOrders)

  // Handle search
  const handleSearch = () => {
    if (searchOrderId.trim()) {
      handleOrderSelect(searchOrderId.trim())
    }
  }

  // Calculate progress percentage with driver acceptance
  const getProgressPercentage = (status) => {
    const statusProgress = {
      initiated: 15,
      paid: 30,
      driver_assigned: 45,
      driver_accepted: 60,
      processing: 75,
      out_for_delivery: 90,
      delivered: 100,
      cancelled: 0,
    }
    return statusProgress[status] || 0
  }

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return ["initiated", "paid", "driver_assigned"].includes(status)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Delivery Status</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your fuel delivery in real-time</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Selection & Search */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Order */}
          <Card className="bg-white dark:bg-gray-800/40 backdrop-blur-md border border-gray-300 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="px-4">
              <CardTitle className="text-lg flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Find Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Order ID"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-500">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <Card className="bg-white dark:bg-gray-800/40 backdrop-blur-md border border-gray-300 dark:border-gray-700/50 shadow-lg">
              <CardHeader className="px-4">
                <CardTitle className="text-lg">Active Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {activeOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => handleOrderSelect(order._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedOrder?._id === order._id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                      <Badge variant="outline" className={getStatusStyle(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {order.orderItems?.[0]?.productName} • {order.orderItems?.[0]?.qunatity}L
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Details & Tracking */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Order Overview */}
              <Card className="bg-white dark:bg-gray-800/40 backdrop-blur-md border border-gray-300 dark:border-gray-700/50 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Order #{selectedOrder._id.slice(-6).toUpperCase()}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Placed on {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className={`${getStatusStyle(selectedOrder.status)} text-sm px-3 py-1`}>
                      {formatStatus(selectedOrder.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {getProgressPercentage(selectedOrder.status)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                      />
                    </div>
                  </div>

                  {/* Driver Acceptance Status */}
                  {selectedOrder.status === "driver_assigned" && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <Timer className="w-5 h-5 text-yellow-600 animate-pulse" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">Awaiting Driver Acceptance</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Driver has been notified and will accept shortly
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === "driver_accepted" && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Driver Accepted!</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your driver has accepted the order and is preparing for delivery
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  {estimatedDelivery && selectedOrder.status !== "delivered" && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Estimated Delivery</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{formatDate(estimatedDelivery)}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Fuel className="w-4 h-4 mr-2" />
                          Fuel Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>{" "}
                            {selectedOrder.orderItems?.[0]?.productName}
                          </p>
                          <p>
                            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>{" "}
                            {selectedOrder.orderItems?.[0]?.qunatity} liters
                          </p>
                          <p>
                            <span className="text-gray-600 dark:text-gray-400">Unit Price:</span> ₦
                            {formatPrice(selectedOrder.orderItems?.[0]?.unitPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Delivery Address
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOrder.orderAddress}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="border-gray-300 dark:border-gray-700" />

                  {/* Total Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ₦{formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Driver Information */}
              {driverInfo && (
                <Card className="bg-white dark:bg-gray-800/40 backdrop-blur-md border border-gray-300 dark:border-gray-700/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Driver Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{driverInfo.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{driverInfo.vehicle}</p>
                          <p className="text-sm text-yellow-600">★ {driverInfo.rating}</p>
                          {selectedOrder.status === "driver_accepted" && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Accepted {formatDate(driverInfo.assignedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tracking Timeline */}
              <Card className="bg-white dark:bg-gray-800/40 backdrop-blur-md border border-gray-300 dark:border-gray-700/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Navigation className="w-5 h-5 mr-2" />
                    Tracking Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingHistory.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            item.completed
                              ? item.error
                                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : item.current
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse"
                                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${item.current ? "text-blue-600 dark:text-blue-400" : ""}`}>
                              {item.title}
                            </h4>
                            {item.timestamp && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(item.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/support/create")}
                  className="bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>

                {/* Cancel Order Button */}
                {canCancelOrder(selectedOrder.status) && (
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                    onClick={() => {
                      // Add cancel order functionality
                      toast.info("Cancel order functionality coming soon!")
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}

                {/* Track Order Button */}
                {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info("Real-time tracking coming soon!")
                    }}
                    className="bg-transparent"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Track Live
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <Card className="bg-white dark:bg-gray-800/40 backdrop-blur-md border border-gray-300 dark:border-gray-700/50 shadow-lg">
              <CardContent className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Order Selected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Search for an order ID or select from your active orders to view tracking details
                </p>
                <Button
                  onClick={() => navigate("/dashboard/order-fuel")}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  <Fuel className="w-4 h-4 mr-2" />
                  Order Fuel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DeliveryStatus
