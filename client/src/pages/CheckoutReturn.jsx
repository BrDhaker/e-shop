"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const CheckoutReturn = () => {
  const [status, setStatus] = useState(null)
  const [customerEmail, setCustomerEmail] = useState("")
  const [orderId, setOrderId] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      const token = localStorage.getItem("accessToken")

      fetch(`/api/payments/session-status?session_id=${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.status)
          setCustomerEmail(data.customer_email)
          setOrderId(data.orderId)
        })
        .catch((error) => {
          console.error("Error checking session status:", error)
          setStatus("error")
        })
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "complete" && orderId) {
      const timer = setTimeout(() => {
        navigate(`/orders/${orderId}?payment=success&method=stripe`)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [status, orderId, navigate])

  if (status === "open") {
    navigate("/checkout")
    return null
  }

  if (status === "complete") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              We appreciate your business! A confirmation email will be sent to {customerEmail}.
            </p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to your order details...</p>
          </div>
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Order Details
          </button>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600">There was an issue processing your payment. Please try again.</p>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing your payment...</p>
      </div>
    </div>
  )
}

export default CheckoutReturn
