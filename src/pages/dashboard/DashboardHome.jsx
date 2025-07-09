"use client"

import { useEffect } from "react"
import useAuthStore from "@/stores/useAuthStore"
import useOrderStore from "@/stores/useOrderStore"
import SavedLocations from "@/components/dashboard/SavedLocations"
import QuickActions from "@/components/dashboard/QuickActions"
import FuelPrices from "@/components/dashboard/FuelPrices"
import RecentOrders from "@/components/dashboard/RecentOrders"

const DashboardHome = () => {
  const { user } = useAuthStore()
  const { orders, loading, error, fetchOrders } = useOrderStore()

  // Fetch recent orders when component mounts
  useEffect(() => {
    fetchOrders("/orders/user?page=1&limit=3")
  }, [fetchOrders])

  return (
    <>
      <QuickActions />
      <FuelPrices />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentOrders orders={orders} loading={loading} error={error} />
        <SavedLocations addresses={user?.addresses || []} />
      </div>
    </>
  )
}

export default DashboardHome
