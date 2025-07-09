"use client"

import { Navigate, useLocation } from "react-router-dom"
import { Suspense, useEffect } from "react"
import useAuthStore from "@/stores/useAuthStore"
import LoadingSpinner from "@/components/LoadingSpinner"

const PublicRoute = ({ children }) => {
  const location = useLocation()
  const { authenticated, loading, checkAuth } = useAuthStore()

  useEffect(() => {
    // Silently check auth status for public routes
    checkAuth()
  }, [checkAuth])

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (authenticated) {
    const authPages = ["/signin", "/signup", "/forgot-password", "/verify-email", "/reset-password"]
    if (authPages.includes(location.pathname)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export default PublicRoute
