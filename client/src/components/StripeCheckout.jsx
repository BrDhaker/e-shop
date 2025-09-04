"use client"

import { useState, useEffect, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { AlertCircle } from "lucide-react"

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51234567890abcdef"
const stripePromise = loadStripe(stripePublishableKey)

const StripeCheckout = ({ amount, cartItems, shippingAddress, onSuccess, onError }) => {
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState("")

  const fetchClientSecret = useCallback(async () => {
    try {
      console.log("CLIENT: Creating Stripe checkout session...")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            cartItems: cartItems.map((item) => ({
              product_id: item.product_id || item.id,
              name: item.products?.name || item.name,
              price: item.products?.price || item.price,
              quantity: item.quantity,
            })),
            shippingAddress,
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.text()
        console.error("CLIENT: Checkout session creation failed:", errorData)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("CLIENT: Checkout session created successfully")
      return data.clientSecret
    } catch (error) {
      console.error("CLIENT: Error creating checkout session:", error)
      setInitError(error.message)
      onError(error)
      return null
    }
  }, [cartItems, shippingAddress, onError])

  useEffect(() => {
    if (cartItems.length > 0 && shippingAddress.streetAddress) {
      fetchClientSecret().then((secret) => {
        if (secret) {
          setClientSecret(secret)
        }
        setLoading(false)
      })
    }
  }, [fetchClientSecret, cartItems, shippingAddress])

  const options = { fetchClientSecret }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Stripe checkout...</span>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-red-800 text-sm">
              <strong>Payment Setup Error:</strong> {initError}
            </p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Make sure the VITE_STRIPE_PUBLISHABLE_KEY environment variable is set and the backend
            server is running.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <p className="text-green-800 text-sm">
          <strong>Real Stripe Demo:</strong> This uses Stripe's test environment. Use test card number 4242 4242 4242
          4242 with any future expiry date and CVC.
        </p>
      </div>

      <div id="checkout">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )
}

export default StripeCheckout
