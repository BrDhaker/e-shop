import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response?.data?.code === "TOKEN_EXPIRED") {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return api(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = localStorage.getItem("refreshToken")

        if (!refreshToken) {
          processQueue(error, null)
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          return Promise.reject(error)
        }

        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken } = response.data
          localStorage.setItem("accessToken", accessToken)

          processQueue(null, accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  resendVerification: (email) => api.post("/auth/resend-verification", { email }),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
}

// Products API
export const productsAPI = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post("/products", productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
}

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get("/categories"),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post("/categories", categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

// Cart API
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity) => api.post("/cart", { productId, quantity }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete("/cart"),
}

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post("/orders", orderData),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

export const reviewsAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  addReview: (reviewData) => api.post("/reviews", reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
}

export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (productId) => api.post("/wishlist", { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
}

export const paymentsAPI = {
  createPayPalOrder: (cartItems, totalAmount) => api.post("/payments/create-paypal-order", { cartItems, totalAmount }),
  capturePayPalOrder: (orderID, cartItems, shippingAddress) =>
    api.post("/payments/capture-paypal-order", { orderID, cartItems, shippingAddress }),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getOrders: (params) => api.get("/admin/orders", { params }),
  getUsers: (params) => api.get("/admin/users", { params }),
  createAdmin: () => api.post("/admin/create-admin"),
}

export default api
