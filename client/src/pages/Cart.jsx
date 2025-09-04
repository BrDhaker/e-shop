"use client"

import { Link } from "react-router-dom"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

const Cart = () => {
  const { cartItems, total, loading, updateCartItem, removeFromCart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    await updateCartItem(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId) => {
    if (confirm("Are you sure you want to remove this item from your cart?")) {
      await removeFromCart(itemId)
    }
  }

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your entire cart?")) {
      await clearCart()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to view your cart.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart.</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <button onClick={handleClearCart} className="text-red-600 hover:text-red-800 font-medium">
              Clear Cart
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={item.products.image_url || "/placeholder.svg?height=80&width=80&query=product"}
                    alt={item.products.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 ml-6">
                  <Link
                    to={`/products/${item.products.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600"
                  >
                    {item.products.name}
                  </Link>
                  <p className="text-gray-600 mt-1">${item.products.price}</p>

                  {item.products.stock_quantity < item.quantity && (
                    <p className="text-red-600 text-sm mt-1">Only {item.products.stock_quantity} left in stock</p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.products.stock_quantity}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-lg font-semibold text-gray-900 w-24 text-right">
                    ${(item.products.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-red-600 hover:text-red-800">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{total >= 50 ? "Free" : "$9.99"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    ${(total + (total >= 50 ? 0 : 9.99) + total * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {total >= 50 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <p className="text-green-800 text-sm font-medium">🎉 You qualify for free shipping!</p>
              </div>
            )}

            <Link
              to="/checkout"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="w-full text-blue-600 hover:text-blue-800 py-3 px-6 text-center block font-medium mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
