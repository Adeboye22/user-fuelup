"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useAuthStore from "@/stores/useAuthStore"
import apiService from "@/lib/api"

const AuthGuard = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { authenticated, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    // Prevent navigation outside dashboard for authenticated users
    const handleBeforeUnload = (e) => {
      if (authenticated && location.pathname.startsWith("/dashboard")) {
        e.preventDefault()
        e.returnValue = "Are you sure you want to leave? You will be logged out."
      }
    }

    // Prevent back/forward navigation outside dashboard
    const handlePopState = (e) => {
      if (authenticated && !window.location.pathname.startsWith("/dashboard")) {
        e.preventDefault()
        navigate("/dashboard", { replace: true })
      }
    }

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Periodic auth check
    const authCheckInterval = setInterval(() => {
      const token = apiService.getToken()
      if (authenticated && (!token || apiService.isTokenExpired(token))) {
        logout()
      }
    }, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
      clearInterval(authCheckInterval)
    }
  }, [authenticated, location.pathname, logout, navigate])

  // Block direct URL access to non-dashboard routes for authenticated users
  useEffect(() => {
    if (authenticated && !location.pathname.startsWith("/dashboard")) {
      navigate("/dashboard", { replace: true })
    }
  }, [authenticated, location.pathname, navigate])

  return children
}

export default AuthGuard
