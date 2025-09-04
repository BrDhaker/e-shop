"use client"

import { Outlet, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Package, FolderOpen, ShoppingBag, Users, LogOut } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

const AdminLayout = () => {
  const location = useLocation()
  const { logout } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: FolderOpen },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Users", href: "/admin/users", icon: Users },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
        </div>

        <nav className="mt-8">
          <div className="space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 px-4">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
