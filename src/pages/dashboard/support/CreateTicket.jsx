"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Send, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import apiService from "@/lib/api"
import { useTheme } from "@/components/theme-provider"
import { toast } from "react-hot-toast"

const CreateTicket = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isLightMode = theme === "light"

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    categoryId: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await apiService.get("/support/categories")

      if (response.status === "success") {
        setCategories(response.data || [])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
      toast.error("Failed to load categories")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please describe your issue"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Please provide more details (at least 10 characters)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const response = await apiService.post("/support/tickets", {
        categoryId: formData.categoryId,
        message: formData.message.trim(),
      })

      console.log(response.data.userId)

      if (response.status === "success") {
        toast.success("Support ticket created successfully!")
        navigate(`/dashboard/support/ticket/${response.data.userId}`)
      } else {
        throw new Error(response.message || "Failed to create ticket")
      }
    } catch (err) {
      console.error("Error creating ticket:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to create ticket"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const styles = {
    cardContainer: isLightMode
      ? "bg-white backdrop-blur-md border border-gray-300 shadow-lg"
      : "bg-gray-800/40 backdrop-blur-md border border-gray-700/50 shadow-lg",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/support">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <Card className={styles.cardContainer}>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Create Support Ticket</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Describe your issue and our support team will help you resolve it
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-gray-700 dark:text-gray-300">
                Category *
              </Label>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                  <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.categoryId && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
                Describe your issue *
              </Label>
              <Textarea
                id="message"
                placeholder="Please provide as much detail as possible about your issue..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className={`min-h-32 ${errors.message ? "border-red-500" : ""}`}
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                {errors.message ? (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                ) : (
                  <div />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">{formData.message.length}/1000</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Tips for better support</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Be specific about the issue you're experiencing</li>
                    <li>• Include any error messages you've seen</li>
                    <li>• Mention what you were trying to do when the issue occurred</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Link to="/dashboard/support">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || categoriesLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CreateTicket
