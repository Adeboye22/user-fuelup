import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PublicRoute from "./routes/PublicRoute"
import ProtectedRoute from "./routes/ProtectedRoute"
import { ThemeProvider } from "./components/theme-provider"
import ScrollToTop from "./components/ScrollToTop"
import { Toaster } from "react-hot-toast"
import SignIn from "./pages/auth/SignIn"
import SignUp from "./pages/auth/SignUp"
import OrderFuel from "./pages/dashboard/OrderFuel"
import OrderHistory from "./pages/dashboard/OrderHistory"
import NotificationsPage from "./pages/dashboard/NotificationsPage"
import Settings from "./pages/dashboard/Settings"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"

// Layouts
const MainLayout = lazy(() => import("./layouts/MainLayout"))
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"))

// Pages
const Home = lazy(() => import("./pages/Home"))
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"))

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
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
          <Route path="/forgot-password" element={
            <Suspense>
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            </Suspense>
          } />
          <Route path="/verify-email" element={
            <Suspense>
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            </Suspense>
          } />
          <Route path="/reset-password" element={
            <Suspense>
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            </Suspense>
          } />

          {/* Public routes with MainLayout */}
          <Route
            element={
              <Suspense>
                <MainLayout />
              </Suspense>
            }
          >
            <Route index element={<Home />} />
            {/* Add other public pages here */}
          </Route>

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
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <ScrollToTop />
      </ThemeProvider>
    </Router>
  )
}

export default App
