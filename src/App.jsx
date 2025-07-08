import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PublicRoute from "./routes/PublicRoute"
import ProtectedRoute from "./routes/ProtectedRoute"
import { ThemeProvider } from "./components/theme-provider"
import ScrollToTop from "./components/ScrollToTop"
import { Toaster } from "react-hot-toast"
import SignIn from "./pages/auth/SignIn"

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
            {/* Add other dashboard routes here */}
          </Route>
        </Routes>
        <ScrollToTop />
      </ThemeProvider>
    </Router>
  )
}

export default App
