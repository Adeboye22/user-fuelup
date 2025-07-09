import { Navigate, useLocation } from "react-router-dom"
import { Suspense } from "react"
import useAuthStore from "@/stores/useAuthStore"
import LoadingSpinner from "@/components/LoadingSpinner"

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { authenticated, loading } = useAuthStore()

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />
  }

  if (!authenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export default ProtectedRoute
