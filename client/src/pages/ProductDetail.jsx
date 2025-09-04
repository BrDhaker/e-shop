"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react"
import { productsAPI } from "../utils/api"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getProduct(id)
      setProduct(response.data.product)
    } catch (error) {
      console.error("Failed to load product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart")
      return
    }

    const result = await addToCart(product.id, quantity)
    if (result.success) {
      alert("Product added to cart!")
    } else {
      alert(result.error)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-800">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const images =
    product.product_images?.length > 0
      ? product.product_images
      : [{ image_url: product.image_url || "/diverse-products-still-life.png" }]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
            <img
              src={images[selectedImage]?.image_url || "/placeholder.svg"}
              alt={product.name}
              className="h-96 w-full object-cover object-center"
            />
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg ${
                    selectedImage === index ? "ring-2 ring-blue-600" : ""
                  }`}
                >
                  <img
                    src={image.image_url || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="h-20 w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {product.categories && <p className="text-lg text-gray-600 mb-4">{product.categories.name}</p>}

          <div className="mb-6">
            <span className="text-3xl font-bold text-gray-900">${product.price}</span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900">Stock:</span>
              <span className={`font-medium ${product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Out of stock"}
              </span>
            </div>

            {product.stock_quantity > 0 && (
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-lg font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock_quantity}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {product.stock_quantity > 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">SKU:</dt>
                <dd className="font-medium">{product.id.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Category:</dt>
                <dd className="font-medium">{product.categories?.name || "Uncategorized"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Availability:</dt>
                <dd className="font-medium">{product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
