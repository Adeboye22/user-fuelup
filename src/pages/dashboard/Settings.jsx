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

export default function Settings() {
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container max-w-6xl mx-auto py-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and personal information</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="sm:w-64 shrink-0">
            <Card>
              <CardContent className="p-0">
                <TabsList className="flex flex-col w-full h-auto bg-transparent space-y-1 p-2">
                  <TabsTrigger
                    value="profile"
                    className="w-full justify-start px-3 py-2.5 h-auto data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="payment"
                    className="w-full justify-start px-3 py-2.5 h-auto data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Payment</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="w-full justify-start px-3 py-2.5 h-auto data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
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
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details and personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-background">
                      <AvatarFallback className="bg-emerald-600 text-white text-xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{fullName}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                      <Label htmlFor="lastName" className="text-sm">
                        Last Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                      <Label htmlFor="email" className="text-sm">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center">
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
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-orange-700 font-medium">You have unsaved address changes</span>
                          <span className="text-xs text-orange-600">Click "Save Addresses" to save your changes</span>
                        </div>
                      )}
                    </div>
                    {localAddresses.length === 0 ? (
                      <div className="text-center py-6 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">No addresses added yet</p>
                        <Button variant="link" onClick={handleAddAddress} className="mt-2">
                          <Plus className="h-4 w-4 mr-1" />
                          Add your first address
                        </Button>
                      </div>
                    ) : (
                      localAddresses.map((address) => (
                        <Card key={address.id || address._id} className="p-4 relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveAddress(address.id || address._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove address</span>
                          </Button>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`address-street-${address.id || address._id}`} className="text-xs">
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
                              <Label htmlFor={`address-city-${address.id || address._id}`} className="text-xs">
                                City
                              </Label>
                              <Input
                                id={`address-city-${address.id || address._id}`}
                                value={address.city || ""}
                                onChange={(e) => handleAddressChange(address.id || address._id, "city", e.target.value)}
                                placeholder="City"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`address-lga-${address.id || address._id}`} className="text-xs">
                                LGA
                              </Label>
                              <Input
                                id={`address-lga-${address.id || address._id}`}
                                value={address.LGA || ""}
                                onChange={(e) => handleAddressChange(address.id || address._id, "LGA", e.target.value)}
                                placeholder="Local Government Area"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`address-state-${address.id || address._id}`} className="text-xs">
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

            <TabsContent value="payment" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Your payment is processed securely through Paystack</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-lg border bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-emerald-100">
                        <CreditCard className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-900">Paystack</h3>
                        <p className="text-sm text-emerald-700">Secure payment processing for all transactions</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-emerald-600 font-medium">Active Payment Method</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-600 mb-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Secured</span>
                      </div>
                      <p className="text-xs text-emerald-600">256-bit SSL encryption</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Supported Payment Options</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Credit & Debit Cards</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Mobile Money</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Bank Transfer</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">USSD</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Secure & Reliable</h4>
                        <p className="text-sm text-blue-700">
                          All payments are processed through Paystack's secure infrastructure with industry-standard
                          encryption and fraud protection.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and account security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">{passwordVisible ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm">
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
                          <Label htmlFor="confirmPassword" className="text-sm">
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

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Advanced Security</h3>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/40">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-full bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-base font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <Switch id="2fa" />
                    </div>
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
