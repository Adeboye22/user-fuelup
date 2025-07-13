"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Fuel, MapPin, Info, CheckCircle, Plus } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import useAuthStore from "@/stores/useAuthStore"
import useAddressStore from "@/stores/useAddressStore"
import useOrderStore from "@/stores/useOrderStore"
import { toast } from "react-hot-toast"
import apiService from "@/lib/api"
import AddressModal from "@/components/dashboard/AddressModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const OrderFuel = () => {
  const { theme } = useTheme()
  const isLightMode = theme === "light"

  // Auth store
  const { user, authenticated } = useAuthStore()

  // Address store
  const { addresses, getDefaultAddress, fetchAddresses } = useAddressStore()

  // Order store
  const { createOrder, loading, error } = useOrderStore()

  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(10)
  const [selectedLocation, setSelectedLocation] = useState("")
  const [step, setStep] = useState(1)
  const [formErrors, setFormErrors] = useState({})
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts()
    fetchAddresses()
  }, [fetchAddresses])

  // Get user's addresses when addresses change
  useEffect(() => {
    const defaultAddress = getDefaultAddress()
    if (defaultAddress) {
      setSelectedLocation(defaultAddress._id || defaultAddress.id)
    }
  }, [addresses, getDefaultAddress])

  // Fetch all available products
  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const response = await apiService.get("/products")
      if (response.status === "success") {
        setProducts(response.data)
        // Pre-select the first product if available
        if (response.data.length > 0) {
          setSelectedProduct(response.data[0])
        }
      } else {
        toast.error("Failed to fetch fuel products")
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      toast.error(err.response?.data?.message || "Failed to fetch fuel products")
    } finally {
      setProductsLoading(false)
    }
  }

  // Calculate fuel cost (in kobo) - using selected product price
  const calculateFuelCost = () => {
    return selectedProduct?.unitPrice * quantity || 0
  }

  // Calculate delivery fee (in kobo)
  const calculateDeliveryFee = () => {
    // return 50000 // 500 NGN
    return 0
  }

  // Calculate service fee (in kobo) - 2% of fuel cost with minimum of 100 NGN
  const calculateServiceFee = () => {
    const fuelCost = calculateFuelCost()
    const serviceFeeTwoPercent = Math.floor(fuelCost * 0.02)
    const minimumServiceFee = 10000 // 100 NGN in kobo
    return Math.max(serviceFeeTwoPercent, minimumServiceFee)
  }

  // Calculate total order amount (in kobo)
  const calculateTotal = () => {
    return calculateFuelCost() + calculateDeliveryFee() + calculateServiceFee()
  }

  // Format price for display (convert kobo to NGN)
  const formatPrice = (amount) => {
    return (amount / 100).toLocaleString()
  }

  // Get selected address details
  const getSelectedAddressDetails = () => {
    return addresses.find((addr) => (addr._id || addr.id) === selectedLocation)
  }

  const handleNext = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      setStep(step + 1)
      // Clear any previous errors
      setFormErrors({})
    }
  }

  const handleBack = () => {
    if (orderCreated) {
      // If order is created, reset everything to start over
      setOrderCreated(false)
      setCreatedOrder(null)
      setStep(1)
    } else {
      setStep(step - 1)
    }
    // Clear any previous errors
    setFormErrors({})
  }

  // Validate form inputs for current step
  const validateCurrentStep = () => {
    const errors = {}

    if (step === 1) {
      if (!selectedProduct) {
        errors.product = "Please select a fuel type"
      }
      if (!quantity || quantity < 10) {
        errors.quantity = "Minimum quantity is 10 liters"
      }
    } else if (step === 2) {
      if (!selectedLocation) {
        errors.location = "Please select a delivery location"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle payment initiation
  const initiatePaystackPayment = async (orderId) => {
    try {
      setPaymentProcessing(true)
      const response = await apiService.post("/payment/initiation", {
        orderId,
      })

      console.log("Payment response:", response)

      // Check if payment link is available
      if (!response?.link) {
        toast.error("Payment link not available")
        return null
      }

      // Show success message before redirect
      toast.success("Redirecting to payment gateway...")

      // Small delay to show the message before redirect
      setTimeout(() => {
        window.location.href = response.link
      }, 1000)

      return response
    } catch (err) {
      console.error("Payment initiation error:", err)
      const errorMessage = err.response?.data?.message || "Failed to initialize payment. Please try again."
      toast.error(errorMessage)
      throw err
    } finally {
      setPaymentProcessing(false)
    }
  }

  // Create order without payment
  const handleCreateOrder = async (e) => {
    e.preventDefault()

    // Final validation for step 2
    if (!validateCurrentStep()) {
      return
    }

    try {
      setIsCreatingOrder(true)

      // Find selected address details
      const selectedAddressObj = getSelectedAddressDetails()
      const addressString = selectedAddressObj
        ? `${selectedAddressObj.street}, ${selectedAddressObj.city}, ${selectedAddressObj.state}`
        : ""

      // Create order data with necessary fields
      const orderData = {
        orderItems: [
          {
            productId: selectedProduct._id,
            qunatity: quantity, // Using the API's expected field name
          },
        ],
        orderAddress: addressString,
      }

      // Submit the order
      const orderResponse = await createOrder(orderData)

      if (orderResponse?.status === "success" && orderResponse?.data?._id) {
        // Show success message for order creation
        toast.success(orderResponse.message || "Order created successfully!")

        // Set order as created and store the order data
        setOrderCreated(true)
        setCreatedOrder(orderResponse.data)
      } else {
        throw new Error(orderResponse?.message || "Order creation failed. No order ID returned.")
      }

      window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    } catch (err) {
      // Show detailed error message
      const errorMessage = error || err.message || "Failed to create order. Please try again."
      toast.error(errorMessage)
      // Log error for debugging
      console.error("Order submission error:", err)
    } finally {
      setIsCreatingOrder(false)
    }
  }

  // Initiate payment separately
  const handleProceedToPayment = async () => {
    if (!createdOrder?._id) {
      toast.error("No order found. Please try again.")
      return
    }

    await initiatePaystackPayment(createdOrder._id)
  }

  // Handle address selection from modal
  const handleAddressSelect = (address) => {
    setSelectedLocation(address._id || address.id)
  }

  // Start new order
  const handleStartNewOrder = () => {
    setOrderCreated(false)
    setCreatedOrder(null)
    setStep(1)
    setFormErrors({})
  }

  // Quantity increment/decrement handlers with steps of 10
  const handleQuantityDecrease = () => {
    const newQuantity = quantity - 10
    setQuantity(Math.max(10, newQuantity)) // Ensure minimum of 10
  }

  const handleQuantityIncrease = () => {
    setQuantity(quantity + 10)
  }

  // Handle manual quantity input
  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value)) {
      setQuantity(Math.max(10, value))
    }
  }

  // Consistent theme styles matching support ticket pages
  const styles = {
    cardContainer: isLightMode
      ? "bg-white backdrop-blur-md border border-gray-300 shadow-lg"
      : "bg-gray-800/40 backdrop-blur-md border border-gray-700/50 shadow-lg",
    progressBar: isLightMode ? "bg-gray-300" : "bg-gray-700",
    stepInactive: isLightMode ? "bg-gray-400 text-white" : "bg-gray-700 text-gray-300",
    stepText: isLightMode ? "text-gray-600" : "text-gray-400",
    cardSelected: isLightMode ? "border-emerald-500 bg-emerald-50" : "border-emerald-500 bg-emerald-500/10 ",
    cardUnselected: isLightMode
      ? "border-gray-300 bg-white hover:bg-gray-50"
      : "border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50",
    labelText: isLightMode ? "text-gray-700" : "text-gray-300",
    summaryBox: isLightMode ? "bg-gray-50 border border-gray-200" : "bg-gray-800/50 border border-gray-700/50",
    inputBg: isLightMode
      ? "bg-white border-gray-300 focus:border-emerald-500"
      : "bg-gray-800 border-gray-700 focus:border-emerald-500",
    buttonBack: isLightMode ? "border-gray-300 hover:bg-gray-50" : "border-gray-600 hover:bg-gray-700/50",
    subtleText: isLightMode ? "text-gray-600" : "text-gray-400",
    divider: isLightMode ? "border-gray-300" : "border-gray-700",
    iconBg: "bg-emerald-600",
    iconInactiveBg: isLightMode ? "bg-gray-300" : "bg-gray-700",
    errorText: "text-red-500 text-sm mt-1",
    successBox: isLightMode ? "bg-green-50 border-green-200" : "bg-green-900/20 border-green-700",
  }

  // Display error message for a field
  const ErrorMessage = ({ name }) => {
    return formErrors[name] ? <p className={styles.errorText}>{formErrors[name]}</p> : null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Order Fuel</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Select your fuel type and delivery location</p>
      </div>

      <Card className={styles.cardContainer}>
        <CardContent className="p-4">
          {/* Show Order Success State */}
          {orderCreated && createdOrder ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="text-white text-3xl" size={48} />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-3">Order Created Successfully!</h2>
                <p className={`${styles.subtleText} text-base md:text-lg max-w-md mx-auto`}>
                  Your fuel order has been created and is ready for payment.
                </p>
              </div>

              {/* Order Details Card */}
              <Card className={`${styles.successBox} p-0 rounded-xl mb-6 border overflow-hidden`}>
                <CardHeader className="pt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b border-green-200 dark:border-green-700">
                  <CardTitle className="text-lg md:text-xl font-semibold text-green-700 dark:text-green-300 flex items-center">
                    <Info className="mr-2 text-green-600" />
                    Order Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 md:p-6">
                  <div className="grid gap-4 md:gap-3">
                    {/* Order ID */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className={`${styles.subtleText} font-medium text-sm md:text-base`}>Order ID:</span>
                      <span className="font-mono text-xs md:text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
                        {createdOrder._id}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className={`${styles.subtleText} font-medium text-sm md:text-base`}>Status:</span>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 w-fit"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        {createdOrder.status.charAt(0).toUpperCase() + createdOrder.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Fuel Details */}
                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-3 md:p-4 space-y-3">
                        <h4 className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                          Fuel Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className={`${styles.subtleText} text-xs md:text-sm block mb-1`}>Fuel Type:</span>
                            <span className="font-medium text-sm md:text-base">
                              {createdOrder.orderItems[0]?.productName}
                            </span>
                          </div>

                          <div>
                            <span className={`${styles.subtleText} text-xs md:text-sm block mb-1`}>Quantity:</span>
                            <span className="font-medium text-sm md:text-base">
                              {createdOrder.orderItems[0]?.qunatity} liters
                            </span>
                          </div>

                          <div>
                            <span className={`${styles.subtleText} text-xs md:text-sm block mb-1`}>Unit Price:</span>
                            <span className="font-medium text-sm md:text-base text-emerald-600">
                              ₦{formatPrice(createdOrder.orderItems[0]?.unitPrice)}
                            </span>
                          </div>

                          <div>
                            <span className={`${styles.subtleText} text-xs md:text-sm block mb-1`}>Subtotal:</span>
                            <span className="font-medium text-sm md:text-base">
                              ₦{formatPrice(createdOrder.orderItems[0]?.price)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Delivery Address */}
                    <Card className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="p-3 md:p-4">
                        <h4 className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <MapPin className="mr-2 text-blue-600" />
                          Delivery Address
                        </h4>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {createdOrder.orderAddress}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Total Amount */}
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-l-4 border-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                            Total Amount:
                          </span>
                          <span className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                            ₦{formatPrice(createdOrder.totalAmount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Instructions */}
              <Card className={`${styles.summaryBox} mb-8`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Info className="text-blue-600 text-lg" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Next Step: Complete Payment
                      </h4>
                      <p className={`text-sm md:text-base ${styles.subtleText} leading-relaxed mb-3`}>
                        You'll be redirected to Paystack's secure payment gateway where you can complete your payment
                        using:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          💳 Debit/Credit Card
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          🏦 Bank Transfer
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          📱 USSD
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Primary Action */}
                <Button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={paymentProcessing}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold text-base md:text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {paymentProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Redirecting to Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </div>
                </Button>

                {/* Secondary Action */}
                <Button
                  type="button"
                  onClick={handleStartNewOrder}
                  variant="outline"
                  className="w-full py-3 px-6 font-medium text-base transition-all duration-200 bg-transparent"
                >
                  Create New Order
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Progress Steps - Only show when not in success state */}
              <div className="flex justify-between mb-8 relative">
                <div className={`absolute top-4 left-0 right-0 h-1 ${styles.progressBar} -z-10`}></div>
                {[1, 2].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        step >= stepNumber ? styles.iconBg + " text-white" : styles.stepInactive
                      }`}
                    >
                      {stepNumber}
                    </div>
                    <span className={`text-xs mt-2 ${styles.stepText}`}>
                      {stepNumber === 1 ? "Select Fuel" : "Delivery & Review"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Select Fuel Type and Quantity */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Select Fuel Type & Quantity
                  </h2>

                  {productsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-white"></div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <label className={`block mb-2 ${styles.labelText}`}>Fuel Type</label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                          {products.map((product) => (
                            <Card
                              key={product._id}
                              onClick={() => setSelectedProduct(product)}
                              className={`cursor-pointer transition-all relative ${
                                selectedProduct?._id === product._id ? styles.cardSelected : styles.cardUnselected
                              }`}
                            >
                              <CardContent className="px-4">
                                {/* Refined Station Name Badge with subtle label - Top Right */}
                                <div className="absolute top-2 right-2 z-10 hidden lg:block">
                                  <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-400 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm">
                                    <MapPin size={12} className="text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-gray-500 dark:text-gray-400 text-[0.7rem]">Petrol Station:</span>
                                    <span className="font-semibold">NNPC</span>
                                  </Badge>
                                </div>
                                <div className="flex items-center mb-2">
                                  <Fuel className="mr-2" />
                                  <span className="capitalize font-medium">{product.name}</span>
                                </div>
                                <div className="text-lg font-bold text-emerald-600">
                                  ₦{formatPrice(product.unitPrice)}/{product.unitOfMeasure}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <ErrorMessage name="product" />
                      </div>

                      <div className="mb-6">
                        <label className={`block mb-2 ${styles.labelText}`}>
                          Quantity ({selectedProduct?.unitOfMeasure || "liters"})
                        </label>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleQuantityDecrease}
                            disabled={quantity <= 10}
                            className="rounded-r-none bg-transparent px-4 py-2 text-lg font-semibold"
                          >
                            -10
                          </Button>
                          <div className="rounded-none border-x-0 text-center w-32 font-medium py-1.5 border bg-transparent">{quantity}</div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleQuantityIncrease}
                            disabled={quantity >= 40}
                            className="rounded-l-none bg-transparent px-4 py-2 text-lg font-semibold"
                          >
                            +10
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Quantity increases in increments of 10 liters
                        </p>
                        <ErrorMessage name="quantity" />
                      </div>

                      <Card className={styles.summaryBox}>
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-2">
                            <span className={styles.subtleText}>
                              Price per {selectedProduct?.unitOfMeasure || "liter"}:
                            </span>
                            <span>₦{formatPrice(selectedProduct?.unitPrice || 0)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className={styles.subtleText}>Quantity:</span>
                            <span>
                              {quantity} {selectedProduct?.unitOfMeasure || "liters"}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className={styles.subtleText}>Subtotal:</span>
                            <span>₦{formatPrice(calculateFuelCost())}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className={styles.subtleText}>Service Fee:</span>
                            <span>₦{formatPrice(calculateServiceFee())}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className={styles.subtleText}>Delivery Fee:</span>
                            <span>₦{formatPrice(calculateDeliveryFee())}</span>
                          </div>
                          <div className={`flex justify-between font-bold text-lg pt-2 border-t ${styles.divider}`}>
                            <span>Total:</span>
                            <span className="text-emerald-600">₦{formatPrice(calculateTotal())}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 2: Delivery Location & Review - Now wrapped in form */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <form onSubmit={handleCreateOrder}>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                      Delivery Location & Order Review
                    </h2>

                    <div className="mb-6">
                      <label className={`block mb-2 ${styles.labelText}`}>Delivery Location</label>
                      <div className="space-y-3">
                        {addresses.map((location) => (
                          <Card
                            key={location._id || location.id}
                            onClick={() => setSelectedLocation(location._id || location.id)}
                            className={`cursor-pointer transition-all ${
                              selectedLocation === (location._id || location.id)
                                ? styles.cardSelected
                                : styles.cardUnselected
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-lg mr-3 ${
                                    selectedLocation === (location._id || location.id)
                                      ? styles.iconBg
                                      : styles.iconInactiveBg
                                  }`}
                                >
                                  <MapPin
                                    className={selectedLocation === (location._id || location.id) ? "text-white" : ""}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium">{location.street || "Address"}</h3>
                                  <p className={`text-sm ${styles.subtleText}`}>
                                    {location.city && `${location.city}`}
                                    {location.LGA && `, ${location.LGA}`}
                                    {location.state && `, ${location.state}`}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        <AddressModal
                          trigger={
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full py-3 border-dashed bg-transparent"
                            >
                              <Plus size={16} className="mr-2" />
                              Add New Location
                            </Button>
                          }
                          open={addressModalOpen}
                          onOpenChange={setAddressModalOpen}
                          onAddressSelect={handleAddressSelect}
                          showSelectButton={true}
                        />
                      </div>
                      <ErrorMessage name="location" />
                    </div>

                    {/* Final Order Summary */}
                    <Card className={styles.summaryBox}>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span className={styles.subtleText}>Fuel Type:</span>
                            <span>{selectedProduct?.name || ""}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={styles.subtleText}>Quantity:</span>
                            <span>
                              {quantity} {selectedProduct?.unitOfMeasure || "liters"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={styles.subtleText}>
                              Price per {selectedProduct?.unitOfMeasure || "liter"}:
                            </span>
                            <span>₦{formatPrice(selectedProduct?.unitPrice || 0)}</span>
                          </div>
                          {/* Delivery Location in Summary */}
                          {getSelectedAddressDetails() && (
                            <div className="flex justify-between">
                              <span className={styles.subtleText}>Delivery to:</span>
                              <span className="text-right max-w-[200px]">
                                {getSelectedAddressDetails().street}
                                {getSelectedAddressDetails().city && `, ${getSelectedAddressDetails().city}`}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className={styles.subtleText}>Subtotal:</span>
                            <span>₦{formatPrice(calculateFuelCost())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={styles.subtleText}>Service Fee:</span>
                            <span>₦{formatPrice(calculateServiceFee())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={styles.subtleText}>Delivery Fee:</span>
                            <span>₦{formatPrice(calculateDeliveryFee())}</span>
                          </div>
                        </div>
                        <div className={`flex justify-between font-bold text-lg pt-3 border-t ${styles.divider}`}>
                          <span>Total:</span>
                          <span className="text-emerald-600">₦{formatPrice(calculateTotal())}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Info boxes */}
                    <Card className={`${styles.summaryBox} mb-6 mt-6`}>
                      <CardContent className="p-4 flex items-start">
                        <Info className="text-blue-500 mt-1 mr-3" />
                        <div>
                          <p className={`text-sm ${styles.subtleText} mb-2`}>
                            <strong>Payment Method:</strong> Paystack (Card, Bank Transfer, USSD)
                          </p>
                          <p className={`text-sm ${styles.subtleText}`}>
                            After creating your order, you'll be able to proceed to secure payment.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={`${styles.summaryBox} mb-6`}>
                      <CardContent className="p-4 flex items-start">
                        <Info className="text-blue-500 mt-1 mr-3" />
                        <p className={`text-sm ${styles.subtleText}`}>
                          Delivery is available 7 days a week during standard hours (8AM-8PM). Delivery will be
                          scheduled within 24 hours of order confirmation.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Submit button for step 2 */}
                    <div className={`flex justify-between pt-4 border-t ${styles.divider}`}>
                      <Button type="button" onClick={handleBack} variant="outline" className="bg-transparent">
                        Back
                      </Button>

                      <Button
                        type="submit"
                        disabled={isCreatingOrder}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {isCreatingOrder ? "Creating Order..." : "Create Order"}
                      </Button>
                    </div>

                    {/* Error message display */}
                    {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
                  </form>
                </motion.div>
              )}

              {/* Navigation Buttons - Only for step 1 */}
              {step === 1 && (
                <div className={`flex justify-between pt-4 mt-4 border-t ${styles.divider}`}>
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    disabled={true}
                    className="opacity-50 cursor-not-allowed bg-transparent"
                  >
                    Back
                  </Button>

                  <Button type="button" onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default OrderFuel
