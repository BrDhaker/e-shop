"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Lock } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { ordersAPI } from "../utils/api"
import PayPalButton from "../components/PayPalButton"
import StripeCheckout from "../components/StripeCheckout"

const Checkout = () => {
  const { cartItems, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const [shippingData, setShippingData] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  })

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const handleShippingChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePaymentChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCardSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const orderData = {
        shippingAddress: shippingData,
        paymentMethod: "card",
      }

      const response = await ordersAPI.createOrder(orderData)

      if (response.data.order) {
        await clearCart()
        navigate(`/orders/${response.data.order.id}`)
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create order")
    } finally {
      setLoading(false)
    }
  }

  const handlePayPalSuccess = async (result) => {
    try {
      await clearCart()
      navigate(`/orders/${result.orderId}?payment=success&method=paypal&id=${result.paymentId}`)
    } catch (error) {
      setError("Order completed but failed to clear cart. Please refresh the page.")
    }
  }

  const handlePayPalError = (error) => {
    setError(`PayPal payment failed: ${error.message}`)
  }

  const handleStripeSuccess = async (result) => {
    try {
      await clearCart()
      navigate(`/orders/${result.orderId}?payment=success&method=stripe&id=${result.paymentId}`)
    } catch (error) {
      setError("Order completed but failed to clear cart. Please refresh the page.")
    }
  }

  const handleStripeError = (error) => {
    setError(`Stripe payment failed: ${error.message}`)
  }

  const subtotal = total
  const shipping = total >= 50 ? 0 : 9.99
  const tax = total * 0.08
  const finalTotal = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingData.fullName}
                  onChange={handleShippingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={shippingData.streetAddress}
                  onChange={handleShippingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingData.city}
                  onChange={handleShippingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingData.state}
                  onChange={handleShippingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingData.postalCode}
                  onChange={handleShippingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  name="country"
                  value={shippingData.country}
                  onChange={handleShippingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="card"
                  name="paymentMethod"
                  type="radio"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                  Credit/Debit Card (Demo)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="stripe"
                  name="paymentMethod"
                  type="radio"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="stripe" className="ml-3 block text-sm font-medium text-gray-700">
                  Stripe (Real Demo)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="paypal"
                  name="paymentMethod"
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                  PayPal (Real Demo)
                </label>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {paymentMethod === "card" && (
            <form onSubmit={handleCardSubmit}>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
                  <Lock className="h-4 w-4 text-green-600 ml-2" />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Demo Mode:</strong> This is a demo checkout. No real payment will be processed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={paymentData.cardholderName}
                      onChange={handlePaymentChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handlePaymentChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handlePaymentChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : `Place Order - $${finalTotal.toFixed(2)}`}
                </button>
              </div>
            </form>
          )}

          {/* Stripe Payment */}
          {paymentMethod === "stripe" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Stripe Payment</h2>
              </div>

              {shippingData.fullName && shippingData.streetAddress && shippingData.city ? (
                <StripeCheckout
                  amount={finalTotal}
                  cartItems={cartItems}
                  shippingAddress={shippingData}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    Please complete the shipping information above to enable Stripe payment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PayPal Payment */}
          {paymentMethod === "paypal" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">PayPal Payment</h2>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>Real PayPal Demo:</strong> This uses PayPal's sandbox environment. You can use test PayPal
                  accounts to complete the payment.
                </p>
              </div>

              {shippingData.fullName && shippingData.streetAddress && shippingData.city ? (
                <PayPalButton
                  cartItems={cartItems}
                  shippingAddress={shippingData}
                  onSuccess={handlePayPalSuccess}
                  onError={handlePayPalError}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    Please complete the shipping information above to enable PayPal payment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.products.image_url || "/placeholder.svg?height=40&width=40&query=product"}
                    alt={item.products.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.products.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">${(item.products.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {shipping === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <p className="text-green-800 text-sm font-medium">🎉 You qualify for free shipping!</p>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
