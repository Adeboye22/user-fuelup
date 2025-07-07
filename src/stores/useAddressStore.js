import { create } from "zustand"
import apiService from "@/lib/api"
import { toast } from "react-hot-toast"

const useAddressStore = create((set, get) => ({
  addresses: [],
  loading: false,
  error: null,

  // Helper function to clean address data for API
  cleanAddressForAPI: (address) => {
    const { _id, id, isDefault, ...cleanAddress } = address
    return cleanAddress
  },

  // Fetch user addresses from the user profile
  fetchAddresses: async () => {
    set({ loading: true, error: null })
    try {
      const response = await apiService.get("/users/me")
      if (response.data?.addresses) {
        set({
          addresses: response.data.addresses.map((addr, index) => ({
            ...addr,
            id: addr._id,
            isDefault: index === 0, // First address is considered default
          })),
        })
      } else {
        set({ addresses: [] })
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      set({ error: error.response?.data?.message || "Failed to fetch addresses" })
    } finally {
      set({ loading: false })
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    set({ loading: true, error: null })
    try {
      const { cleanAddressForAPI } = get()

      // Get current user data
      const userResponse = await apiService.get("/users/me")
      const currentUser = userResponse.data

      // Ensure addresses is an array and add new address
      const currentAddresses = Array.isArray(currentUser.addresses) ? currentUser.addresses : []

      // Clean existing addresses and add new one
      const cleanedCurrentAddresses = currentAddresses.map(cleanAddressForAPI)
      const cleanedNewAddress = cleanAddressForAPI(addressData)
      const updatedAddresses = [...cleanedCurrentAddresses, cleanedNewAddress]

      // Update user profile with new addresses array - only send necessary fields
      const updateData = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone || "",
        addresses: updatedAddresses,
      }

      const response = await apiService.put("/users/me", updateData)

      if (response.data?.addresses) {
        set({
          addresses: response.data.addresses.map((addr, index) => ({
            ...addr,
            id: addr._id,
            isDefault: index === 0,
          })),
        })
        toast.success("Address added successfully")
        return true
      }
    } catch (error) {
      console.error("Error adding address:", error)
      const errorMessage = error.response?.data?.message || "Failed to add address"
      set({ error: errorMessage })
      toast.error(errorMessage)
      return false
    } finally {
      set({ loading: false })
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    set({ loading: true, error: null })
    try {
      const { cleanAddressForAPI } = get()

      // Get current user data
      const userResponse = await apiService.get("/users/me")
      const currentUser = userResponse.data

      // Ensure addresses is an array and update the specific address
      const currentAddresses = Array.isArray(currentUser.addresses) ? currentUser.addresses : []
      const updatedAddresses = currentAddresses.map((addr) => {
        if (addr._id === addressId) {
          // Merge the updated data and clean it
          const mergedAddress = { ...addr, ...addressData }
          return cleanAddressForAPI(mergedAddress)
        }
        return cleanAddressForAPI(addr)
      })

      // Update user profile with modified addresses array - only send necessary fields
      const updateData = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone || "",
        addresses: updatedAddresses,
      }

      const response = await apiService.put("/users/me", updateData)

      if (response.data?.addresses) {
        set({
          addresses: response.data.addresses.map((addr, index) => ({
            ...addr,
            id: addr._id,
            isDefault: index === 0,
          })),
        })
        toast.success("Address updated successfully")
        return true
      }
    } catch (error) {
      console.error("Error updating address:", error)
      const errorMessage = error.response?.data?.message || "Failed to update address"
      set({ error: errorMessage })
      toast.error(errorMessage)
      return false
    } finally {
      set({ loading: false })
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    set({ loading: true, error: null })
    try {
      const { cleanAddressForAPI } = get()

      // Get current user data
      const userResponse = await apiService.get("/users/me")
      const currentUser = userResponse.data

      // Ensure addresses is an array and remove the address
      const currentAddresses = Array.isArray(currentUser.addresses) ? currentUser.addresses : []
      const filteredAddresses = currentAddresses.filter((addr) => addr._id !== addressId)

      // Clean the remaining addresses
      const updatedAddresses = filteredAddresses.map(cleanAddressForAPI)

      // Update user profile with filtered addresses array - only send necessary fields
      const updateData = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone || "",
        addresses: updatedAddresses,
      }

      const response = await apiService.put("/users/me", updateData)

      if (response.data) {
        const responseAddresses = Array.isArray(response.data.addresses) ? response.data.addresses : []
        set({
          addresses: responseAddresses.map((addr, index) => ({
            ...addr,
            id: addr._id,
            isDefault: index === 0,
          })),
        })
        toast.success("Address deleted successfully")
        return true
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete address"
      set({ error: errorMessage })
      toast.error(errorMessage)
      return false
    } finally {
      set({ loading: false })
    }
  },

  // Set default address (reorder addresses array so default is first)
  setDefaultAddress: async (addressId) => {
    set({ loading: true, error: null })
    try {
      const { cleanAddressForAPI } = get()

      // Get current user data
      const userResponse = await apiService.get("/users/me")
      const currentUser = userResponse.data

      // Ensure addresses is an array
      const currentAddresses = Array.isArray(currentUser.addresses) ? currentUser.addresses : []

      // Find the address to make default
      const defaultAddress = currentAddresses.find((addr) => addr._id === addressId)
      const otherAddresses = currentAddresses.filter((addr) => addr._id !== addressId)

      if (!defaultAddress) {
        throw new Error("Address not found")
      }

      // Reorder addresses with default first and clean them
      const reorderedAddresses = [defaultAddress, ...otherAddresses].map(cleanAddressForAPI)

      // Update user profile with reordered addresses array - only send necessary fields
      const updateData = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone || "",
        addresses: reorderedAddresses,
      }

      const response = await apiService.put("/users/me", updateData)

      if (response.data?.addresses) {
        set({
          addresses: response.data.addresses.map((addr, index) => ({
            ...addr,
            id: addr._id,
            isDefault: index === 0,
          })),
        })
        toast.success("Default address updated")
        return true
      }
    } catch (error) {
      console.error("Error setting default address:", error)
      const errorMessage = error.response?.data?.message || "Failed to set default address"
      set({ error: errorMessage })
      toast.error(errorMessage)
      return false
    } finally {
      set({ loading: false })
    }
  },

  // Update local address state immediately (for UI responsiveness)
  updateLocalAddress: (addressId, field, value) => {
    const { addresses } = get()
    const updatedAddresses = addresses.map((addr) =>
      (addr.id || addr._id) === addressId ? { ...addr, [field]: value } : addr,
    )
    set({ addresses: updatedAddresses })
  },

  // Get default address
  getDefaultAddress: () => {
    const { addresses } = get()
    return addresses.find((addr) => addr.isDefault) || addresses[0] || null
  },

  // Clear error
  clearError: () => set({ error: null }),
}))

export default useAddressStore
