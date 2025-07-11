"use client"

import { useEffect } from "react"
import useAuthStore from "@/stores/useAuthStore"
import useOrderStore from "@/stores/useOrderStore"
import SavedLocations from "@/components/dashboard/SavedLocations"
import QuickActions from "@/components/dashboard/QuickActions"
import FuelPrices from "@/components/dashboard/FuelPrices"
import RecentOrders from "@/components/dashboard/RecentOrders"
import DeliveryStatusWidget from "@/components/dashboard/DeliveryStatusWidget"

const DashboardHome = () => {
  const { user } = useAuthStore()
  const { orders, loading, error, fetchOrders } = useOrderStore()

  // Fetch recent orders when component mounts
  useEffect(() => {
    fetchOrders("/orders/user?page=1&limit=3")
  }, [fetchOrders])

  // Get user's first name to display
  const firstName = user?.name?.split(" ")[0] || user?.firstName || "Driver"

  return (
    <>
      <div className="block md:hidden mb-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {firstName}</p>
      </div>
      <QuickActions />
      <FuelPrices />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentOrders orders={orders} loading={loading} error={error} />
        <DeliveryStatusWidget />
        <SavedLocations addresses={user?.addresses || []} />
      </div>
    </>
  )
}

export default DashboardHome
