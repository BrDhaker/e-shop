"use client"

import { useCallback, useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { useNavigate, Navigate } from "react-router-dom"

// Load Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51RyPXiAARHOHfG6cUN0kioD06q9iis4Agcp5v9ZUoduOrwHxMxhOrntw959EsM4YENz2IGi1RYhR2oX4vGaFch6800ojjslLx4",
)

const StripeEmbeddedCheckout = ({ cartItems, shippingAddress, onSuccess, onError }) => {
  const navigate = useNavigate()

  const fetchClientSecret = useCallback(() => {
    const token = localStorage.getItem("token")

    return fetch("/api/payments/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cartItems,
        shippingAddress,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create checkout session")
        }
        return res.json()
      })
      .then((data) => data.clientSecret)
      .catch((error) => {
        console.error("Error creating checkout session:", error)
        onError?.(error.message)
        throw error
      })
  }, [cartItems, shippingAddress, onError])

  const options = { fetchClientSecret }

  if (!cartItems?.length) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">No items in cart</p>
      </div>
    )
  }

  return (
    <div id="stripe-checkout" className="w-full">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

const Return = () => {
  const [status, setStatus] = useState(null)
  const [customerEmail, setCustomerEmail] = useState("")

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const sessionId = urlParams.get("session_id")

    fetch(`/api/payments/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status)
        setCustomerEmail(data.customer_email)
      })
  }, [])

  if (status === "open") {
    return <Navigate to="/checkout" />
  }

  if (status === "complete") {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to {customerEmail}. If you have any questions,
          please email <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    )
  }

  return null
}

const App = () => {
  return (
    <div className="App">
      {/* <Router> */}
      {/* <Routes> */}
      {/* <Route path="/checkout" element={<StripeEmbeddedCheckout />} /> */}
      {/* <Route path="/return" element={<Return />} /> */}
      {/* </Routes> */}
      {/* </Router> */}
    </div>
  )
}

export default StripeEmbeddedCheckout
