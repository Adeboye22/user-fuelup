"use client"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { Fuel, History, Bell, Settings, Truck, X, MessageSquare } from "lucide-react"

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/50 z-30" onClick={toggleSidebar} />
      )}

      {/* Sidebar for desktop */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex w-64 flex-col bg-white/90 dark:bg-gray-800/40 backdrop-blur-md h-screen fixed border-r border-gray-200 dark:border-gray-700/50 py-8 px-4 z-40"
      >
        <SidebarContent />
      </motion.div>

      {/* Sidebar for mobile */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden flex w-full flex-col bg-white/95 dark:bg-gray-800/90 backdrop-blur-md h-screen fixed border-r border-gray-200 dark:border-gray-700/50 py-8 px-4 z-40"
      >
        <div className="flex justify-between items-center mb-6 px-4">
          <Link to="/" className="inline-block" onClick={toggleSidebar}>
            <img src="/icons/Logo.png" className="h-14" alt="fuel logo" />
          </Link>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent toggleSidebar={toggleSidebar} />
      </motion.div>
    </>
  )
}

// Extract sidebar content to avoid repetition
const SidebarContent = ({ toggleSidebar }) => {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <>
      <div className="mb-10 px-4 md:block hidden">
        <Link to="/" className="inline-block">
          <img src="/icons/Logo.png" className="h-14" alt="fuel logo" />
        </Link>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <SidebarItem
            to="/dashboard"
            icon={<Fuel size={18} />}
            label="Dashboard"
            active={currentPath === "/dashboard"}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/dashboard/order-fuel"
            icon={<Truck size={18} />}
            label="Order Fuel"
            active={currentPath === "/dashboard/order-fuel"}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/dashboard/order-history"
            icon={<History size={18} />}
            label="Order History"
            active={currentPath === "/dashboard/order-history"}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/dashboard/support"
            icon={<MessageSquare size={18} />}
            label="Support"
            active={currentPath.startsWith("/dashboard/support")}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/dashboard/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            active={currentPath === "/dashboard/notifications"}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/dashboard/settings"
            icon={<Settings size={18} />}
            label="Account Settings"
            active={currentPath === "/dashboard/settings"}
            toggleSidebar={toggleSidebar}
          />
        </ul>
      </nav>

      <SupportBox toggleSidebar={toggleSidebar} />
    </>
  )
}

const SidebarItem = ({ to, icon, label, active, toggleSidebar }) => {
  // Handle click to close sidebar (only affects mobile view due to media queries)
  const handleClick = () => {
    if (toggleSidebar) {
      toggleSidebar()
    }
  }

  return (
    <li>
      <Link
        to={to}
        onClick={handleClick}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
          active
            ? "text-emerald-700 bg-emerald-50 border-l-4 border-emerald-500 dark:text-white dark:bg-emerald-600/20 dark:border-emerald-500"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/30 dark:hover:text-white"
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span className={active ? "font-medium" : ""}>{label}</span>
      </Link>
    </li>
  )
}

const SupportBox = ({ toggleSidebar }) => {
  // Handle support button click to close sidebar on mobile
  const handleSupportClick = () => {
    if (toggleSidebar) {
      toggleSidebar()
    }
    // Navigate to support page
    window.location.href = "/dashboard/support/create"
  }

  return (
    <div className="mt-auto">
      <div className="p-4 bg-gray-100 dark:bg-gray-700/40 rounded-lg backdrop-blur-sm border border-gray-200 dark:border-gray-600/50">
        <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Need Assistance?</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Our support team is here to help you 24/7</p>
        <button
          onClick={handleSupportClick}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm transition-colors"
        >
          Contact Support
        </button>
      </div>
    </div>
  )
}

export default Sidebar
