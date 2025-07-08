"use client"

import { useState, useEffect } from "react"
import { MapPin, Edit, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import useAddressStore from "@/stores/useAddressStore"

const AddressModal = ({ trigger, open, onOpenChange, onAddressSelect = null, showSelectButton = false }) => {
  const { addresses, loading, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAddressStore()

  const [selectedTab, setSelectedTab] = useState("saved")
  const [editingAddress, setEditingAddress] = useState(null)
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    LGA: "",
  })

  // Fetch addresses when modal opens
  useEffect(() => {
    if (open) {
      fetchAddresses()
    }
  }, [open, fetchAddresses])

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city) {
      toast.error("Street and city are required")
      return
    }

    let success = false
    if (editingAddress) {
      success = await updateAddress(editingAddress.id || editingAddress._id, newAddress)
      setEditingAddress(null)
    } else {
      success = await addAddress(newAddress)
    }

    if (success) {
      setNewAddress({ street: "", city: "", state: "", LGA: "" })
      setSelectedTab("saved")
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setNewAddress({
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      LGA: address.LGA || "",
    })
    setSelectedTab("add")
  }

  const handleDeleteAddress = async (addressId) => {
    await deleteAddress(addressId)
  }

  const handleSetDefaultAddress = async (addressId) => {
    const success = await setDefaultAddress(addressId)
    if (success && !showSelectButton) {
      onOpenChange?.(false)
    }
  }

  const handleSelectAddress = (address) => {
    if (onAddressSelect) {
      onAddressSelect(address)
      onOpenChange?.(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={18} className="text-emerald-500" />
            Delivery Addresses
          </DialogTitle>
        </DialogHeader>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved">Saved Addresses</TabsTrigger>
            <TabsTrigger value="add">{editingAddress ? "Edit Address" : "Add New"}</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-4">
            <ScrollArea className="h-72 pr-4">
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id || address._id}
                      className={`p-4 border rounded-xl flex flex-col gap-2 transition-all hover:shadow-sm ${
                        address.isDefault
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{address.street}</h4>
                          {address.isDefault && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 font-normal py-0"
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit
                              size={14}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteAddress(address.id || address._id)}
                            disabled={loading}
                          >
                            <Trash2
                              size={14}
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {address.city && `${address.city}`}
                        {address.LGA && `, ${address.LGA}`}
                        {address.state && `, ${address.state}`}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id || address._id)}
                            className="text-xs w-fit hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                            disabled={loading}
                          >
                            <Check size={12} className="mr-1" />
                            Set as Default
                          </Button>
                        )}
                        {showSelectButton && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAddress(address)}
                            className="text-xs w-fit"
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <MapPin className="mx-auto mb-2" size={24} />
                  <p>No saved addresses</p>
                  <Button variant="link" onClick={() => setSelectedTab("add")} className="mt-2">
                    Add a new address
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-sm font-medium">
                  Street Address
                </Label>
                <Input
                  id="street"
                  placeholder="Enter your street address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lga" className="text-sm font-medium">
                    LGA
                  </Label>
                  <Input
                    id="lga"
                    placeholder="Local Government Area"
                    value={newAddress.LGA}
                    onChange={(e) => setNewAddress({ ...newAddress, LGA: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  State
                </Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <Button
                onClick={handleAddAddress}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading || !newAddress.street || !newAddress.city}
              >
                {loading ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AddressModal
