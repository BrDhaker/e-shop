"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react"
import { ordersAPI } from "../utils/api"

const OrderDetail = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getOrder(id)
      setOrder(response.data.order)
    } catch (error) {
      console.error("Failed to load order:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Package className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link to="/orders" className="text-blue-600 hover:text-blue-800">
            ← Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link to="/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
                <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                {getStatusIcon(order.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Order Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["pending", "processing", "shipped", "delivered"].includes(order.status)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-2">Pending</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2">
                  <div
                    className={`h-full bg-blue-600 ${
                      ["processing", "shipped", "delivered"].includes(order.status) ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["processing", "shipped", "delivered"].includes(order.status)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-2">Processing</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2">
                  <div
                    className={`h-full bg-blue-600 ${
                      ["shipped", "delivered"].includes(order.status) ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["shipped", "delivered"].includes(order.status)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-2">Shipped</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2">
                  <div className={`h-full bg-blue-600 ${order.status === "delivered" ? "w-full" : "w-0"}`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      order.status === "delivered" ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-2">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.products?.image_url || "/placeholder.svg?height=80&width=80&query=product"}
                    alt={item.products?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.products?.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Price: ${item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${order.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${(order.total_amount * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    ${(Number.parseFloat(order.total_amount) + Number.parseFloat(order.total_amount) * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.addresses && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-600">
                <p>{order.addresses.street_address}</p>
                <p>
                  {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}
                </p>
                <p>{order.addresses.country}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
