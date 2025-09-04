import express from "express"
import supabase from "../config/supabase.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get dashboard statistics
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Get total products
    const { count: totalProducts, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "delivered")

    const totalRevenue = revenueData?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from("orders")
      .select(`
        *,
        users (
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get low stock products
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from("products")
      .select("*")
      .lte("stock_quantity", 10)
      .eq("is_active", true)
      .order("stock_quantity")
      .limit(5)

    if (usersError || productsError || ordersError || revenueError || recentOrdersError || lowStockError) {
      return res.status(500).json({ message: "Failed to fetch dashboard data" })
    }

    res.json({
      statistics: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      recentOrders,
      lowStockProducts,
    })
  } catch (error) {
    console.error("Dashboard fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all orders (Admin only)
router.get("/orders", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const offset = (page - 1) * limit

    let query = supabase.from("orders").select(`
        *,
        users (
          first_name,
          last_name,
          email
        ),
        order_items (
          quantity,
          price,
          products (
            name
          )
        )
      `)

    if (status) {
      query = query.eq("status", status)
    }

    const {
      data: orders,
      error,
      count,
    } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      return res.status(500).json({ message: "Failed to fetch orders" })
    }

    res.json({
      orders,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Admin orders fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all users (Admin only)
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    const {
      data: users,
      error,
      count,
    } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return res.status(500).json({ message: "Failed to fetch users" })
    }

    res.json({
      users,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
