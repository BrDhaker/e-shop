"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      loadUser()
    } else {
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        refreshAccessToken()
      } else {
        setLoading(false)
      }
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.data.user)
    } catch (error) {
      console.error("Failed to load user:", error)
      if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED") {
        await refreshAccessToken()
      } else {
        clearTokens()
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshAccessToken = async () => {
    if (isRefreshing) return false

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      setLoading(false)
      return false
    }

    setIsRefreshing(true)
    try {
      const response = await authAPI.refreshToken(refreshToken)
      const { accessToken } = response.data

      localStorage.setItem("accessToken", accessToken)
      await loadUser()
      return true
    } catch (error) {
      console.error("Token refresh failed:", error)
      clearTokens()
      return false
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { accessToken, refreshToken, user } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { message, user, requiresVerification } = response.data

      // Don't automatically log in user if email verification is required
      if (requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          message: message,
          user: user,
        }
      } else {
        // Legacy flow - if no verification required, log in user
        const { token, user: registeredUser } = response.data
        localStorage.setItem("accessToken", token)
        setUser(registeredUser)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  const clearTokens = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email)
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send reset email",
      }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password)
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to reset password",
      }
    }
  }

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token)
      setUser(response.data.user)
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Email verification failed",
      }
    }
  }

  const resendVerification = async (email) => {
    try {
      const response = await authAPI.resendVerification(email)
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to resend verification email",
      }
    }
  }

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Update failed",
      }
    }
  }

  const value = {
    user,
    loading,
    isRefreshing,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshAccessToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isEmailVerified: user?.email_verified || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
