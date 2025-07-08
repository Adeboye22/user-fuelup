import { Navigate, useLocation } from "react-router-dom"
import { Suspense } from "react"
import useAuthStore from "@/stores/useAuthStore"
import LoadingSpinner from "@/components/LoadingSpinner"

const PublicRoute = ({ children }) => {
  const location = useLocation()
  const { authenticated, loading } = useAuthStore()

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner /> // Replace with your loading component
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (authenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />
  }

  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export default PublicRoute
