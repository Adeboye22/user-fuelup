import { Navigate, useLocation } from "react-router-dom"
import { Suspense } from "react"
import useAuthStore from "@/stores/useAuthStore"

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { authenticated, loading } = useAuthStore()

  // Show loading spinner while checking authentication
  if (loading) {
    return <div>Loading...</div> 
  }

  if (!authenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}

export default ProtectedRoute
