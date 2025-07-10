"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Truck, Clock, CheckCircle, AlertCircle, UserCheck, Timer } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import useOrderStore from "../../stores/useOrderStore"

const DeliveryStatusWidget = () => {
  const navigate = useNavigate()
  const { orders, fetchOrders } = useOrderStore()
  const [activeOrders, setActiveOrders] = useState([])

  useEffect(() => {
    fetchOrders("/orders/user?page=1&limit=5")
  }, [fetchOrders])

  useEffect(() => {
    // Filter for active orders (not delivered or cancelled)
    const active = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled")
    setActiveOrders(active.slice(0, 3)) // Show max 3 active orders
  }, [orders])

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "processing":
      case "out_for_delivery":
        return <Truck className="w-4 h-4 text-blue-600" />
      case "driver_accepted":
        return <UserCheck className="w-4 h-4 text-green-600" />
      case "driver_assigned":
        return <Timer className="w-4 h-4 text-yellow-600" />
      case "initiated":
      case "paid":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
      case "driver_accepted":
        return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
      case "processing":
      case "out_for_delivery":
        return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
      case "driver_assigned":
      case "initiated":
      case "paid":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
    }
  }

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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (activeOrders.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Active Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No active deliveries</p>
          <Button onClick={() => navigate("/dashboard/order-fuel")} className="bg-emerald-600 hover:bg-emerald-500">
            Order Fuel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Active Deliveries
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/delivery-status")}
            className="text-emerald-600 hover:text-emerald-500"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeOrders.map((order) => (
          <motion.div
            key={order._id}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/dashboard/delivery-status?orderId=${order._id}`)}
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="font-medium text-sm">#{order._id.slice(-6).toUpperCase()}</span>
              </div>
              <Badge variant="outline" className={getStatusStyle(order.status)}>
                {formatStatus(order.status)}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
              <span>
                {order.orderItems?.[0]?.productName} • {order.orderItems?.[0]?.qunatity}L
              </span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            {/* Driver acceptance indicator */}
            {order.status === "driver_assigned" && (
              <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                <Timer className="w-3 h-3 animate-pulse" />
                <span>Awaiting driver acceptance</span>
              </div>
            )}
            {order.status === "driver_accepted" && (
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                <UserCheck className="w-3 h-3" />
                <span>Driver accepted</span>
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

export default DeliveryStatusWidget
