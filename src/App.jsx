"use client"

import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PublicRoute from "./routes/PublicRoute"
import ProtectedRoute from "./routes/ProtectedRoute"
import AuthGuard from "./components/AuthGuard"
import { ThemeProvider } from "./components/theme-provider"
import ScrollToTop from "./components/ScrollToTop"
import { Toaster } from "react-hot-toast"
import useAuthStore from "./stores/useAuthStore"
import SignIn from "./pages/auth/SignIn"
import SignUp from "./pages/auth/SignUp"
import OrderFuel from "./pages/dashboard/OrderFuel"
import OrderHistory from "./pages/dashboard/OrderHistory"
import DeliveryStatus from "./pages/dashboard/DeliveryStatus"
import NotificationsPage from "./pages/dashboard/NotificationsPage"
import Settings from "./pages/dashboard/Settings"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"

// Support Components
import SupportDashboard from "./pages/dashboard/support/SupportDashboard"
import CreateTicket from "./pages/dashboard/support/CreateTicket"
import TicketDetail from "./pages/dashboard/support/TicketDetail"
import LoadingSpinner from "./components/LoadingSpinner"

// Layouts
const MainLayout = lazy(() => import("./layouts/MainLayout"))
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"))

// Pages
const Home = lazy(() => import("./pages/Home"))
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"))

function App() {
  const { checkAuth, authenticated } = useAuthStore()

  useEffect(() => {
    // Check authentication status on app load
    checkAuth()
  }, [checkAuth])

  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthGuard>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes - Auth pages */}
            <Route
              path="/signin"
              element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <PublicRoute>
                  <VerifyEmailPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            {/* Public routes with MainLayout - Only accessible when not authenticated */}
            {!authenticated && (
              <Route
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <MainLayout />
                  </Suspense>
                }
              >
                <Route index element={<Home />} />
              </Route>
            )}

            {/* Protected routes with DashboardLayout */}
            <Route
              path="/dashboard"
              element={
                <Suspense>
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                </Suspense>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="order-fuel" element={<OrderFuel />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="delivery-status" element={<DeliveryStatus />} />
              <Route path="delivery-status/:orderId" element={<DeliveryStatus />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<Settings />} />

              {/* Support Routes */}
              <Route path="support" element={<SupportDashboard />} />
              <Route path="support/create" element={<CreateTicket />} />
              <Route path="support/ticket/:ticketId" element={<TicketDetail />} />
            </Route>

            {/* Catch all route - redirect based on auth status */}
            <Route
              path="*"
              element={
                authenticated ? (
                  <ProtectedRoute>
                    <DashboardHome />
                  </ProtectedRoute>
                ) : (
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                )
              }
            />
          </Routes>
          <ScrollToTop />
        </AuthGuard>
      </ThemeProvider>
    </Router>
  )
}

export default App
