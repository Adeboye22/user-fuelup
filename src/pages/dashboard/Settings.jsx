"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { User, Lock, Shield, Smartphone, Mail, Save, Home, Plus, Trash2, CreditCard, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast"
import useAuthStore from "@/stores/useAuthStore"
import useAddressStore from "@/stores/useAddressStore"
import apiService from "@/lib/api"
import { useTheme } from "@/components/theme-provider"
import { ThemeToggleInline } from "@/components/theme-toggle-inline"

export default function Settings() {
  const { theme } = useTheme()
  const isLightMode = theme === "light"

  const { user, updateProfile, changePassword } = useAuthStore()
  const {
    addresses,
    loading: addressLoading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    updateLocalAddress,
  } = useAddressStore()

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressesFetched, setAddressesFetched] = useState(false)

  // Local state for addresses to avoid API calls on every keystroke
  const [localAddresses, setLocalAddresses] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifyOrderUpdates: true,
    notifyPromotions: false,
    notifyPriceChanges: true,
  })

  // Consistent theme styles matching support ticket pages
  const styles = {
    cardContainer: isLightMode
      ? "bg-white backdrop-blur-md border border-gray-300 shadow-lg"
      : "bg-gray-800/40 backdrop-blur-md border border-gray-700/50 shadow-lg",
    tabsList: isLightMode ? "bg-gray-100/50" : "bg-gray-800/50",
    tabsTrigger: isLightMode
      ? "data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
      : "data-[state=active]:bg-gray-700/50 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm",
    inputContainer: isLightMode
      ? "bg-white border-gray-300 focus-within:border-emerald-500"
      : "bg-gray-800 border-gray-700 focus-within:border-emerald-500",
    addressCard: isLightMode ? "bg-gray-50 border-gray-200" : "bg-gray-800/50 border-gray-700/50",
    successBox: isLightMode ? "bg-green-50 border-green-200" : "bg-green-900/20 border-green-700",
    warningBox: isLightMode ? "bg-orange-50 border-orange-200" : "bg-orange-900/20 border-orange-700",
    infoBox: isLightMode ? "bg-blue-50 border-blue-200" : "bg-blue-900/20 border-blue-700",
  }

  // Memoized fetch function to prevent unnecessary calls
  const memoizedFetchAddresses = useCallback(async () => {
    if (!addressesFetched) {
      await fetchAddresses()
      setAddressesFetched(true)
    }
  }, [fetchAddresses, addressesFetched])

  // Initialize form with user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }))
    }
  }, [user])

  // Fetch addresses only once when component mounts
  useEffect(() => {
    memoizedFetchAddresses()
  }, [memoizedFetchAddresses])

  // Update local addresses when store addresses change
  useEffect(() => {
    setLocalAddresses([...addresses])
    setHasUnsavedChanges(false)
  }, [addresses])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Add a new empty address (only locally)
  const handleAddAddress = () => {
    const newAddress = {
      id: `temp-${Date.now()}`, // Temporary ID for local state
      street: "",
      city: "",
      LGA: "",
      state: "",
      isNew: true, // Flag to identify new addresses
    }
    setLocalAddresses((prev) => [...prev, newAddress])
    setHasUnsavedChanges(true)
  }

  // Remove an address (only locally)
  const handleRemoveAddress = (addressId) => {
    setLocalAddresses((prev) => prev.filter((addr) => (addr.id || addr._id) !== addressId))
    setHasUnsavedChanges(true)
  }

  // Update an address field (only locally)
  const handleAddressChange = (addressId, field, value) => {
    setLocalAddresses((prev) =>
      prev.map((addr) => ((addr.id || addr._id) === addressId ? { ...addr, [field]: value } : addr)),
    )
    setHasUnsavedChanges(true)
  }

  // Save all address changes to the API
  const handleSaveAddresses = async () => {
    try {
      setIsSubmitting(true)
      // Get current user data
      const userResponse = await apiService.get("/users/me")
      const currentUser = userResponse.data

      // Clean addresses for API (remove temporary IDs and flags)
      const cleanedAddresses = localAddresses
        .filter((addr) => addr.street || addr.city || addr.LGA || addr.state) // Only save non-empty addresses
        .map((addr) => {
          const { id, _id, isDefault, isNew, ...cleanAddr } = addr
          return cleanAddr
        })

      // Update user profile with new addresses
      const updateData = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone || "",
        addresses: cleanedAddresses,
      }

      const response = await apiService.put("/users/me", updateData)
      if (response.data?.addresses) {
        // Update the store with the response
        useAddressStore.setState({
          addresses: response.data.addresses.map((addr, index) => ({
            ...addr,
            id: addr._id,
            isDefault: index === 0,
          })),
        })
        toast.success("Addresses saved successfully")
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error("Error saving addresses:", error)
      toast.error(error.response?.data?.message || "Failed to save addresses")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSubmitting(true)
      // Create data object for API request
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || "",
      }

      // Using the API directly since we're updating the user's own profile
      const response = await apiService.put("/users/me", profileData)

      // Update user in auth store
      if (response.data) {
        await updateProfile(profileData)
        toast.success("Profile information updated successfully")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error(error.response?.data?.message || "Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePassword = async () => {
    // Validation checks
    if (!formData.currentPassword) {
      toast.error("Current password is required")
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    try {
      setIsSubmitting(true)
      // Use the auth store function instead of direct API call
      await changePassword(formData.newPassword)
      toast.success("Password updated successfully")
      // Clear the password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to update password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Display user's full name
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : ""

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!user) return ""
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : firstName.charAt(0) || ""
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account preferences and personal information
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 shrink-0">
            <Card className={`py-0 ${styles.cardContainer} lg:sticky top-28`}>
              <CardContent className="p-0">
                <TabsList className={`flex flex-col w-full h-auto ${styles.tabsList} space-y-1 p-4`}>
                  <TabsTrigger
                    value="profile"
                    className={`w-full justify-start px-3 py-2.5 h-auto ${styles.tabsTrigger}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="theme"
                    className={`w-full justify-start px-3 py-2.5 h-auto ${styles.tabsTrigger}`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Theme Settings</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className={`w-full justify-start px-3 py-2.5 h-auto ${styles.tabsTrigger}`}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Security</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <TabsContent value="profile" className="m-0">
              <Card className={styles.cardContainer}>
                <CardHeader className="px-4">
                  <CardTitle className="text-gray-800 dark:text-white">Personal Information</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Update your profile details and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-background">
                      <AvatarFallback className="bg-emerald-600 text-white text-xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{fullName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  <Separator className="border-gray-300 dark:border-gray-700" />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm text-gray-700 dark:text-gray-300">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm text-gray-700 dark:text-gray-300">
                        Last Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm text-gray-700 dark:text-gray-300">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="border-gray-300 dark:border-gray-700" />

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center text-gray-800 dark:text-white">
                          <Home className="h-5 w-5 mr-2" />
                          Addresses
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddAddress}
                            className="flex items-center bg-transparent"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Address
                          </Button>
                          {hasUnsavedChanges && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSaveAddresses}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Saving..." : "Save Addresses"}
                            </Button>
                          )}
                        </div>
                      </div>
                      {hasUnsavedChanges && (
                        <Card className={`${styles.warningBox} border`}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                                You have unsaved address changes
                              </span>
                              <span className="text-xs text-orange-600 dark:text-orange-400">
                                Click "Save Addresses" to save your changes
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    {localAddresses.length === 0 ? (
                      <Card className={styles.cardContainer}>
                        <CardContent className="p-6 text-center">
                          <p className="text-gray-600 dark:text-gray-400">No addresses added yet</p>
                          <Button variant="link" onClick={handleAddAddress} className="mt-2 text-emerald-600">
                            <Plus className="h-4 w-4 mr-1" />
                            Add your first address
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      localAddresses.map((address) => (
                        <Card key={address.id || address._id} className={`${styles.addressCard} relative`}>
                          <CardContent className="p-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-500"
                              onClick={() => handleRemoveAddress(address.id || address._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove address</span>
                            </Button>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`address-street-${address.id || address._id}`}
                                  className="text-xs text-gray-700 dark:text-gray-300"
                                >
                                  Street Address
                                </Label>
                                <Input
                                  id={`address-street-${address.id || address._id}`}
                                  value={address.street || ""}
                                  onChange={(e) =>
                                    handleAddressChange(address.id || address._id, "street", e.target.value)
                                  }
                                  placeholder="Street address"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`address-city-${address.id || address._id}`}
                                  className="text-xs text-gray-700 dark:text-gray-300"
                                >
                                  City
                                </Label>
                                <Input
                                  id={`address-city-${address.id || address._id}`}
                                  value={address.city || ""}
                                  onChange={(e) =>
                                    handleAddressChange(address.id || address._id, "city", e.target.value)
                                  }
                                  placeholder="City"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`address-lga-${address.id || address._id}`}
                                  className="text-xs text-gray-700 dark:text-gray-300"
                                >
                                  LGA
                                </Label>
                                <Input
                                  id={`address-lga-${address.id || address._id}`}
                                  value={address.LGA || ""}
                                  onChange={(e) =>
                                    handleAddressChange(address.id || address._id, "LGA", e.target.value)
                                  }
                                  placeholder="Local Government Area"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`address-state-${address.id || address._id}`}
                                  className="text-xs text-gray-700 dark:text-gray-300"
                                >
                                  State
                                </Label>
                                <Input
                                  id={`address-state-${address.id || address._id}`}
                                  value={address.state || ""}
                                  onChange={(e) =>
                                    handleAddressChange(address.id || address._id, "state", e.target.value)
                                  }
                                  placeholder="State"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Saving...</span>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme" className="m-0">
              {/* Theme Settings Card */}
              <Card className={styles.cardContainer}>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>Choose your preferred theme for the dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Appearance</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select your preferred theme or use system setting
                      </p>
                    </div>
                    <ThemeToggleInline />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <Card className={styles.cardContainer}>
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Manage your password and account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm text-gray-700 dark:text-gray-300">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={passwordVisible ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                          >
                            {passwordVisible ? (
                              <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                            <span className="sr-only">{passwordVisible ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm text-gray-700 dark:text-gray-300">
                            New Password
                          </Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm text-gray-700 dark:text-gray-300">
                            Confirm Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSavePassword}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        disabled={
                          isSubmitting ||
                          !formData.currentPassword ||
                          !formData.newPassword ||
                          !formData.confirmPassword
                        }
                      >
                        {isSubmitting ? (
                          <span className="animate-pulse">Updating...</span>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator className="border-gray-300 dark:border-gray-700" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">Advanced Security</h3>
                    <Card className={styles.cardContainer}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                              <Shield className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="text-base font-medium text-gray-800 dark:text-white">
                                Two-Factor Authentication
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                          </div>
                          <Switch id="2fa" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </motion.div>
  )
}
