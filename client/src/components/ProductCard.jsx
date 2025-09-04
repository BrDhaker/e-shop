"use client"

import { Link } from "react-router-dom"
import { ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

const ProductCard = ({ product, viewMode = "grid" }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      alert("Please login to add items to cart")
      return
    }

    const result = await addToCart(product.id, 1)
    if (result.success) {
      alert("Product added to cart!")
    } else {
      alert(result.error)
    }
  }

  if (viewMode === "list") {
    return (
      <Link to={`/products/${product.id}`} className="group">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex">
          <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
            <img
              src={product.image_url || "/placeholder.svg?height=128&width=128&query=product"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 p-4 flex justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
              {product.categories && <p className="text-sm text-gray-500 mb-2">{product.categories.name}</p>}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              <span className="text-xl font-bold text-gray-900">${product.price}</span>
            </div>

            <div className="flex flex-col items-end justify-between ml-4">
              <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>
              {product.stock_quantity > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  title="Add to cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-red-500 text-sm font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          <img
            src={product.image_url || "/placeholder.svg?height=300&width=300&query=product"}
            alt={product.name}
            className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

          {product.categories && <p className="text-sm text-gray-500 mb-2">{product.categories.name}</p>}

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">${product.price}</span>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>

              {product.stock_quantity > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  title="Add to cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-red-500 text-sm font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
