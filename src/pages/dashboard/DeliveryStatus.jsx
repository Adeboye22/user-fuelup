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
} from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import useOrderStore from "@/stores/useOrderStore"
import useAuthStore from "@/stores/useAuthStore"
import toast from "react-hot-toast"

const DeliveryStatus = () => {
  const { theme } = useTheme()
  const isLightMode = theme === "light"
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

  // Theme styles
  const styles = {
    cardContainer: isLightMode
      ? "bg-white backdrop-blur-md border border-gray-300 shadow-lg"
      : "bg-gray-800/40 backdrop-blur-md border border-gray-700/50 shadow-lg",
    statusActive: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    statusPending: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    statusWarning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
    statusError: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    progressBar: isLightMode ? "bg-gray-200" : "bg-gray-700",
    progressFill: "bg-emerald-500",
    subtleText: isLightMode ? "text-gray-600" : "text-gray-400",
    divider: isLightMode ? "border-gray-300" : "border-gray-700",
  }

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

      // Mock driver info (in real app, this would come from API)
      if (order.status === "processing" || order.status === "delivered") {
        setDriverInfo({
          name: "John Doe",
          phone: "+234 801 234 5678",
          vehicle: "Toyota Hilux - ABC 123 XY",
          rating: 4.8,
        })
      }
    } catch (err) {
      toast.error("Order not found or you don't have permission to view it")
      setSelectedOrder(null)
    }
  }

  // Generate tracking history based on order status
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

    if (order.status === "paid" || order.status === "processing" || order.status === "delivered") {
      history.push({
        status: "paid",
        title: "Payment Confirmed",
        description: "Payment has been successfully processed",
        timestamp: order.updatedAt,
        completed: true,
        icon: <CheckCircle className="w-5 h-5" />,
      })
    }

    if (order.status === "processing" || order.status === "delivered") {
      history.push({
        status: "processing",
        title: "Preparing for Delivery",
        description: "Your fuel is being prepared and driver assigned",
        timestamp: order.updatedAt,
        completed: true,
        icon: <Truck className="w-5 h-5" />,
      })
    }

    if (order.status === "delivered") {
      history.push({
        status: "delivered",
        title: "Delivered",
        description: "Your fuel has been successfully delivered",
        timestamp: order.updatedAt,
        completed: true,
        icon: <CheckCircle className="w-5 h-5" />,
      })
    } else if (order.status === "processing") {
      history.push({
        status: "out_for_delivery",
        title: "Out for Delivery",
        description: "Driver is on the way to your location",
        timestamp: null,
        completed: false,
        current: true,
        icon: <Navigation className="w-5 h-5" />,
      })
    }

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

    // Mock calculation - in real app, this would be based on actual logistics
    const now = new Date()
    const estimatedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    setEstimatedDelivery(estimatedTime)
  }

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
      case "paid":
        return styles.statusActive
      case "processing":
        return styles.statusPending
      case "initiated":
        return styles.statusWarning
      case "cancelled":
        return styles.statusError
      default:
        return styles.statusPending
    }
  }

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      initiated: "Order Placed",
      paid: "Payment Confirmed",
      processing: "Being Prepared",
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

  // Handle search
  const handleSearch = () => {
    if (searchOrderId.trim()) {
      handleOrderSelect(searchOrderId.trim())
    }
  }

  // Calculate progress percentage
  const getProgressPercentage = (status) => {
    const statusProgress = {
      initiated: 25,
      paid: 50,
      processing: 75,
      delivered: 100,
      cancelled: 0,
    }
    return statusProgress[status] || 0
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
                <Card className={styles.cardContainer}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Search className="w-5 h-5 mr-2" />
                            Find Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    <Card className={styles.cardContainer}>
                        <CardHeader>
                            <CardTitle className="text-lg">Active Orders</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
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
                        <Card className={styles.cardContainer}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">Order #{selectedOrder._id.slice(-6).toUpperCase()}</CardTitle>
                                        <p className={`${styles.subtleText} mt-1`}>Placed on {formatDate(selectedOrder.createdAt)}</p>
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
                                        <span className={styles.subtleText}>Progress</span>
                                        <span className={styles.subtleText}>{getProgressPercentage(selectedOrder.status)}%</span>
                                    </div>
                                    <div className={`w-full h-2 ${styles.progressBar} rounded-full overflow-hidden`}>
                                        <div
                                            className={`h-full ${styles.progressFill} transition-all duration-500 ease-out`}
                                            style={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                                        />
                                    </div>
                                </div>

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
                                                    <span className={styles.subtleText}>Type:</span>{" "}
                                                    {selectedOrder.orderItems?.[0]?.productName}
                                                </p>
                                                <p>
                                                    <span className={styles.subtleText}>Quantity:</span>{" "}
                                                    {selectedOrder.orderItems?.[0]?.qunatity} liters
                                                </p>
                                                <p>
                                                    <span className={styles.subtleText}>Unit Price:</span> ₦
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

                                <Separator className={styles.divider} />

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
                            <Card className={styles.cardContainer}>
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
                        <Card className={`${styles.cardContainer}`}>
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
                                                <p className={`text-sm ${styles.subtleText} mt-1`}>{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/dashboard/support/create")}
                                className="bg-transparent"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Support
                            </Button>
                            {selectedOrder.status === "initiated" && (
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                                >
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Cancel Order
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <Card className={styles.cardContainer}>
                        <CardContent className="text-center py-12">
                            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Order Selected</h3>
                            <p className={`${styles.subtleText} mb-6`}>
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
