"use client"

import { useState, useEffect } from "react"
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import { adminAPI } from "../../utils/api"

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = [
    {
      name: "Total Users",
      value: dashboardData?.statistics?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Total Products",
      value: dashboardData?.statistics?.totalProducts || 0,
      icon: Package,
      color: "bg-green-500",
    },
    {
      name: "Total Orders",
      value: dashboardData?.statistics?.totalOrders || 0,
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
    {
      name: "Total Revenue",
      value: `$${dashboardData?.statistics?.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          {dashboardData?.recentOrders?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.users?.first_name} {order.users?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.total_amount}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>

          {dashboardData?.lowStockProducts?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">{product.stock_quantity} left</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">All products are well stocked</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
