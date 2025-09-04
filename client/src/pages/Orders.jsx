"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Package, Eye } from "lucide-react"
import { ordersAPI } from "../utils/api"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getOrders()
      setOrders(response.data.orders)
    } catch (error) {
      console.error("Failed to load orders:", error)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-8">Start shopping to see your orders here.</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <Link to={`/orders/${order.id}`} className="flex items-center text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-xl font-bold text-gray-900">${order.total_amount}</span>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.order_items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <img
                              src={item.products?.image_url || "/placeholder.svg?height=40&width=40&query=product"}
                              alt={item.products?.name}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.products?.name}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ${item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <p className="text-sm text-gray-600">+{order.order_items.length - 3} more item(s)</p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.addresses && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address:</h4>
                      <p className="text-sm text-gray-600">
                        {order.addresses.street_address}, {order.addresses.city}, {order.addresses.state}{" "}
                        {order.addresses.postal_code}, {order.addresses.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
