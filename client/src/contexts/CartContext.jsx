"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { cartAPI } from "../utils/api"
import { useAuth } from "./AuthContext"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadCart()
    } else {
      setCartItems([])
      setTotal(0)
    }
  }, [isAuthenticated])

  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await cartAPI.getCart()
      setCartItems(response.data.cartItems)
      setTotal(response.data.total)
    } catch (error) {
      console.error("Failed to load cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart(productId, quantity)
      await loadCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add to cart",
      }
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    try {
      await cartAPI.updateCartItem(itemId, quantity)
      await loadCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update cart",
      }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId)
      await loadCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to remove from cart",
      }
    }
  }

  const clearCart = async () => {
    try {
      await cartAPI.clearCart()
      setCartItems([])
      setTotal(0)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to clear cart",
      }
    }
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cartItems,
    total,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemsCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
