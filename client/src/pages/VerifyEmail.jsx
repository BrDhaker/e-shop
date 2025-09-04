"use client"

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState("verifying") // verifying, success, error
  const [message, setMessage] = useState("")
  const { verifyEmail } = useAuth()

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. Please check your email for the correct link.")
      return
    }

    const handleVerification = async () => {
      try {
        const result = await verifyEmail(token)

        if (result.success) {
          setStatus("success")
          setMessage("Your email has been successfully verified! You can now log in to your account.")
        } else {
          setStatus("error")
          setMessage(result.error || "Email verification failed. The link may be expired or invalid.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An unexpected error occurred. Please try again or contact support.")
      }
    }

    handleVerification()
  }, [searchParams, verifyEmail])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === "verifying" && (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Verifying Your Email</h2>
              <p className="mt-2 text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Email Verified!</h2>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">{message}</p>
              </div>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue to Login
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Verification Failed</h2>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{message}</p>
              </div>
              <div className="mt-6 space-y-4">
                <Link
                  to="/resend-verification"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Resend Verification Email
                </Link>
                <Link
                  to="/register"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Registration
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
