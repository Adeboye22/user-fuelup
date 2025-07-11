"use client"

import DashboardHeader from "@/components/dashboard/DashboardHeader"
import Sidebar from "@/components/dashboard/Sidebar"
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning"
import { useState } from "react"
import { Outlet } from "react-router-dom"

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-800 dark:text-white">
      <SessionTimeoutWarning />
      <div className="md:flex w-full">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 md:ml-64">
          <div className="p-4 lg:p-6">
            <DashboardHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="mt-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
