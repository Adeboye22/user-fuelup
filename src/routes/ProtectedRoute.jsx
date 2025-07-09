"use client"

import { Navigate, useLocation } from "react-router-dom"
import { Suspense, useEffect } from "react"
import useAuthStore from "@/stores/useAuthStore"
import LoadingSpinner from "@/components/LoadingSpinner"
import apiService from "@/lib/api"

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { authenticated, loading, checkAuth, logout } = useAuthStore()

  useEffect(() => {
    // Check authentication status on mount
    const verifyAuth = async () => {
      const token = apiService.getToken()

      // If no token, logout immediately
      if (!token) {
        logout()
        return
      }

      // If token is expired, logout
      if (apiService.isTokenExpired(token)) {
        logout()
        return
      }

      // Verify with server
      const isValid = await checkAuth()
      if (!isValid) {
        logout()
      }
    }

    verifyAuth()
  }, [checkAuth, logout])

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />
  }

  // If not authenticated, redirect to signin
  if (!authenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // Additional security: Check if trying to access non-dashboard routes
  if (authenticated && !location.pathname.startsWith("/dashboard")) {
    return <Navigate to="/dashboard" replace />
  }

  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export default ProtectedRoute
