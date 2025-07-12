"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Fuel, MapPin } from "lucide-react"
import apiService from "@/lib/api"
import { Badge } from "../ui/badge"

const FuelPrices = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.get("/products")
        if (response.status === "success") {
          setProducts(response.data)
        } else {
          setError("Failed to fetch products")
        }
      } catch (err) {
        setError("Error connecting to the server")
        console.error("Error fetching products:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Function to get color based on product name
  const getProductColor = (name) => {
    const nameLC = name.toLowerCase()
    if (nameLC.includes("petrol")) return "red"
    if (nameLC.includes("diesel")) return "yellow"
    if (nameLC.includes("kerosene")) return "blue"
    return "gray" // default color
  }

  // Function to format price from kobo to naira
  const formatPrice = (priceInKobo) => {
    return priceInKobo / 100
  }

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Current Fuel Prices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-sm animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Current Fuel Prices</h2>
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 p-4 rounded-lg text-red-700 dark:text-red-400">
          {error}. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Current Fuel Prices</h2>
        <Badge className="text-xs bg-gray-600 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-300">
          Updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <FuelPriceCard
              key={product._id}
              type={product.name}
              price={formatPrice(product.unitPrice)}
              color={getProductColor(product.name)}
              unit={product.unitOfMeasure}
              stationName={product.stationName || product.fillingStation || "NNPC"}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            No fuel prices available at the moment.
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Fuel Price Card Component
const FuelPriceCard = ({ type, price, color, unit, stationName }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case "red":
        return {
          bg: "bg-red-100 dark:bg-red-500/20",
          text: "text-red-500",
        }
      case "yellow":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-500/20",
          text: "text-yellow-500",
        }
      case "blue":
        return {
          bg: "bg-blue-100 dark:bg-blue-500/20",
          text: "text-blue-500",
        }
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-500/20",
          text: "text-gray-500",
        }
    }
  }

  const colorClasses = getColorClasses(color)

  return (
    <div className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-sm relative">
      {/* Refined Station Name Badge with subtle label - Top Right */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-400 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <MapPin size={12} className="text-yellow-600 dark:text-yellow-400" />
          <span className="text-gray-500 dark:text-gray-400 text-[0.7rem]">Petrol Station:</span>
          <span className="font-semibold">{stationName}</span>
        </Badge>
      </div>

      <div className="flex justify-between items-center mb-3 pr-4">
        <div className="flex items-center">
          <div className={`${colorClasses.bg} p-2 rounded-lg mr-3`}>
            <Fuel className={colorClasses.text} size={20} />
          </div>
          <span className="font-medium text-gray-800 dark:text-white">{type}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800 dark:text-white">
        ₦{price.toLocaleString()}
        <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/{unit}</span>
      </div>
    </div>
  )
}

export default FuelPrices
