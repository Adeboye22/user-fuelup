import apiService from "@/lib/api"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      authenticated: false,
      loading: false,
      error: null,
      tempEmail: null,
      tempOtp: null,
      sessionExpiry: null,

      setTempEmail: (email) => {
        set({ tempEmail: email })
      },

      setTempOtp: (otp) => {
        set({ tempOtp: otp })
      },

      clearTempData: () => {
        set({
          tempEmail: null,
          tempOtp: null,
        })
      },

      setUser: (userData) => {
        set({ user: userData })
      },

      // Enhanced login with session management
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.post("/auth/login", { email, password })

          if (response.data?.accessToken) {
            apiService.setToken(response.data.accessToken)

            // Calculate session expiry
            const token = response.data.accessToken
            const payload = JSON.parse(atob(token.split(".")[1]))
            const sessionExpiry = payload.exp * 1000

            const userData = await apiService.get("/users/me")
            set({
              user: userData.data,
              authenticated: true,
              loading: false,
              sessionExpiry,
            })

            // Start session monitoring
            get().startSessionMonitoring()

            return { success: true, user: userData.data }
          } else if (response.message === "EMAIL_NOT_VERIFIED") {
            set({
              loading: false,
              error: "EMAIL_NOT_VERIFIED",
            })
            return { success: false, error: "EMAIL_NOT_VERIFIED" }
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Login failed",
            loading: false,
            authenticated: false,
            user: null,
          })
          return { success: false, error: error.response?.data?.message || "Login failed" }
        }
      },

      // Register with enhanced error handling
      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.post("/auth/signup", userData)
          set({
            tempEmail: userData.email,
            loading: false,
            error: null,
          })
          return { success: true, email: userData.email }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Registration failed",
            loading: false,
          })
          throw error
        }
      },

      // Enhanced auth check with token validation
      checkAuth: async () => {
        set({ loading: true })
        try {
          const token = apiService.getToken()

          // No token means not authenticated
          if (!token) {
            set({ user: null, authenticated: false, loading: false })
            return false
          }

          // Check if token is expired
          if (apiService.isTokenExpired(token)) {
            get().logout()
            return false
          }

          // Validate token with server
          try {
            const userData = await apiService.get("/users/me")

            // Calculate session expiry
            const payload = JSON.parse(atob(token.split(".")[1]))
            const sessionExpiry = payload.exp * 1000

            set({
              user: userData.data,
              authenticated: true,
              loading: false,
              sessionExpiry,
            })

            // Start session monitoring
            get().startSessionMonitoring()

            return true
          } catch (error) {
            // Token is invalid, logout user
            get().logout()
            return false
          }
        } catch (error) {
          get().logout()
          return false
        }
      },

      // Enhanced logout with cleanup
      logout: () => {
        // Clear session monitoring
        get().stopSessionMonitoring()

        // Remove token and clear API instance
        apiService.removeToken()

        // Reset auth state
        set({
          user: null,
          authenticated: false,
          loading: false,
          sessionExpiry: null,
          error: null,
        })

        // Redirect to login
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/signin"
        }
      },

      // Session monitoring
      _sessionInterval: null,

      startSessionMonitoring: () => {
        const state = get()

        // Clear existing interval
        state.stopSessionMonitoring()

        // Check session every minute
        const interval = setInterval(() => {
          const currentState = get()
          const token = apiService.getToken()

          if (!token || apiService.isTokenExpired(token)) {
            currentState.logout()
            return
          }

          // Check if session is about to expire (5 minutes)
          if (currentState.sessionExpiry) {
            const timeUntilExpiry = currentState.sessionExpiry - Date.now()
            if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
              // Show warning or attempt refresh
              console.warn("Session expiring soon")
            }
          }
        }, 60000) // Check every minute

        set({ _sessionInterval: interval })
      },

      stopSessionMonitoring: () => {
        const state = get()
        if (state._sessionInterval) {
          clearInterval(state._sessionInterval)
          set({ _sessionInterval: null })
        }
      },

      // Verify Email
      verifyEmail: async (email, otp) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.post("/auth/signup-verification", { email, otp })
          set({ loading: false })
          return { success: true, data: response.responseBody }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Email verification failed",
            loading: false,
          })
          throw error
        }
      },

      // Resend OTP
      resendOtp: async (email) => {
        set({ error: null })
        try {
          const response = await apiService.post("/auth/resend-otp", { email })
          return response.responseBody
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to resend OTP",
          })
          throw error
        }
      },

      // Forgot Password
      forgotPassword: async (email) => {
        set({
          loading: true,
          error: null,
          tempEmail: email,
        })
        try {
          const response = await apiService.post("/auth/forgot-password", { email })
          set({ loading: false })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to process request",
            loading: false,
          })
          throw error
        }
      },

      // Reset Password
      resetPassword: async (password, otp) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.post("/auth/reset-password", {
            otp: otp,
            password,
          })
          set({
            loading: false,
            tempOtp: null,
          })
          return response.responseBody
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to reset password",
            loading: false,
          })
          throw error
        }
      },

      // Update User Profile
      updateProfile: async (formData) => {
        set({ error: null })
        try {
          const response = await apiService.put("/users/me", formData, {
            "Content-Type": "multipart/form-data",
          })

          if (response.data) {
            set({
              user: {
                ...response.data,
                profile_image_url: response.data.profile_image_url || response.data.media?.[0]?.original_url,
              },
            })
            return response.data
          }
        } catch (error) {
          console.error("Profile update error:", error)
          set({
            error: error.response?.data?.message || "Failed to update profile",
          })
          throw error
        }
      },

      // Address management methods (keeping existing functionality)
      addAddress: async (addressData) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.post("/users/address", addressData)

          const currentUser = get().user
          const updatedAddresses = [...(currentUser.addresses || []), response.data]

          set({
            user: {
              ...currentUser,
              addresses: updatedAddresses,
            },
            loading: false,
          })

          return { success: true, address: response.data }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to add address",
            loading: false,
          })
          throw error
        }
      },

      updateAddress: async (addressId, addressData) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.put(`/users/address/${addressId}`, addressData)

          const currentUser = get().user
          const updatedAddresses = currentUser.addresses.map((addr) => (addr._id === addressId ? response.data : addr))

          set({
            user: {
              ...currentUser,
              addresses: updatedAddresses,
            },
            loading: false,
          })

          return { success: true, address: response.data }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to update address",
            loading: false,
          })
          throw error
        }
      },

      deleteAddress: async (addressId) => {
        set({ loading: true, error: null })
        try {
          await apiService.delete(`/users/address/${addressId}`)

          const currentUser = get().user
          const updatedAddresses = currentUser.addresses.filter((addr) => addr._id !== addressId)

          set({
            user: {
              ...currentUser,
              addresses: updatedAddresses,
            },
            loading: false,
          })

          return { success: true }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to delete address",
            loading: false,
          })
          throw error
        }
      },

      setDefaultAddress: async (addressId) => {
        set({ loading: true, error: null })
        try {
          await apiService.put(`/users/address/${addressId}/default`)

          const currentUser = get().user
          const updatedAddresses = currentUser.addresses.map((addr) => ({
            ...addr,
            isDefault: addr._id === addressId,
          }))

          set({
            user: {
              ...currentUser,
              addresses: updatedAddresses,
            },
            loading: false,
          })

          return { success: true }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to set default address",
            loading: false,
          })
          throw error
        }
      },

      changePassword: async (newPassword) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.patch("/users/password-change", {
            newPassword,
          })
          set({ loading: false })
          return { success: true, data: response.data }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to change password",
            loading: false,
          })
          throw error
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        tempEmail: state.tempEmail,
        tempOtp: state.tempOtp,
        user: state.user,
        authenticated: state.authenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)

// Set up API service with auth store reference
apiService.setAuthStore(useAuthStore)

export default useAuthStore
