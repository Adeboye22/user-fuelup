"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import NotificationBell from "./NotificationBell"
import { useNavigate } from "react-router-dom"
import useAuthStore from "@/stores/useAuthStore"
import useAddressStore from "@/stores/useAddressStore"
import { MapPin, Menu, X, Plus, LogOut, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "../mode-toggle"
import UserAvatar from "./UserAvatar"
import AddressModal from "./AddressModal"

const DashboardHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { logout, user } = useAuthStore()
  const { addresses, getDefaultAddress, setDefaultAddress, fetchAddresses } = useAddressStore()
  const navigate = useNavigate()
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)

  // Get user's first name to display
  const firstName = user?.firstName || "User"

  // Fetch addresses when component mounts
  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  // Get current default address
  const currentAddress = getDefaultAddress()

  // Logout handler
  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  const handleSetDefaultAddress = async (addressId) => {
    await setDefaultAddress(addressId)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center mb-6 z-20 bg-background/90 dark:bg-gray-800/40 backdrop-blur-2xl dark:border-b dark:border-gray-800 border-gray-700/50 rounded-xl px-4 lg:px-8 py-4 sticky top-4 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none transition-colors md:hidden"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {firstName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AddressModal
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-gray-700 dark:text-gray-300 px-3 py-2 h-9 rounded-full transition-all hover:shadow-md bg-transparent"
            >
              <MapPin size={16} className="text-emerald-500" />
              <span className="hidden md:inline text-xs font-normal">Deliver to:</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 max-w-32 truncate">
                {currentAddress?.street || "Add address"}
              </span>
            </Button>
          }
          open={addressDialogOpen}
          onOpenChange={setAddressDialogOpen}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <MapPin size={18} className="text-emerald-500 sm:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current delivery address</p>
              <p className="font-medium truncate">{currentAddress?.street || "None selected"}</p>
            </div>
            <DropdownMenuSeparator />
            {addresses.slice(0, 3).map((address) => (
              <DropdownMenuItem
                key={address.id || address._id}
                onClick={() => handleSetDefaultAddress(address.id || address._id)}
                className="cursor-pointer flex justify-between items-center"
              >
                <div className="truncate">
                  <span className="font-medium">{address.street}</span>
                  {address.isDefault && <span className="ml-2 text-xs text-emerald-600">• Default</span>}
                </div>
                {!address.isDefault && (
                  <Check size={14} className="opacity-0 group-hover:opacity-100 text-emerald-500" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setAddressDialogOpen(true)} className="cursor-pointer">
              <Plus size={14} className="mr-2" />
              Manage addresses
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-8 hidden sm:block" />
        <NotificationBell />
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer ml-1">
              <UserAvatar user={user} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col space-y-1 p-2">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 focus:text-red-700 cursor-pointer"
            >
              <LogOut size={14} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}

export default DashboardHeader
