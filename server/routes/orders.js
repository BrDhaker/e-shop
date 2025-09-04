import express from "express"
import { body, validationResult } from "express-validator"
import supabase from "../config/supabase.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get user's orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        ),
        addresses (
          street_address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return res.status(500).json({ message: "Failed to fetch orders" })
    }

    res.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single order
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    let query = supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        ),
        addresses (
          street_address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq("id", id)

    // If not admin, only show user's own orders
    if (req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id)
    }

    const { data: order, error } = await query.single()

    if (error || !order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ order })
  } catch (error) {
    console.error("Order fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new order
router.post(
  "/",
  authenticateToken,
  [
    body("shippingAddress").isObject(),
    body("shippingAddress.streetAddress").trim().isLength({ min: 1 }),
    body("shippingAddress.city").trim().isLength({ min: 1 }),
    body("shippingAddress.state").trim().isLength({ min: 1 }),
    body("shippingAddress.postalCode").trim().isLength({ min: 1 }),
    body("shippingAddress.country").trim().isLength({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { shippingAddress } = req.body

      // Get user's cart items
      const { data: cartItems, error: cartError } = await supabase
        .from("cart")
        .select(`
          *,
          products (
            id,
            name,
            price,
            stock_quantity,
            is_active
          )
        `)
        .eq("user_id", req.user.id)

      if (cartError || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" })
      }

      // Validate stock and calculate total
      let totalAmount = 0
      for (const item of cartItems) {
        if (!item.products.is_active) {
          return res.status(400).json({
            message: `Product ${item.products.name} is no longer available`,
          })
        }
        if (item.products.stock_quantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${item.products.name}`,
          })
        }
        totalAmount += item.products.price * item.quantity
      }

      // Create shipping address
      const { data: address, error: addressError } = await supabase
        .from("addresses")
        .insert({
          user_id: req.user.id,
          street_address: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
        })
        .select()
        .single()

      if (addressError) {
        return res.status(500).json({ message: "Failed to create shipping address" })
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: req.user.id,
          total_amount: totalAmount,
          shipping_address_id: address.id,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) {
        return res.status(500).json({ message: "Failed to create order" })
      }

      // Create order items and update stock
      const orderItems = []
      for (const item of cartItems) {
        // Create order item
        const { data: orderItem, error: orderItemError } = await supabase
          .from("order_items")
          .insert({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.products.price,
          })
          .select()
          .single()

        if (orderItemError) {
          return res.status(500).json({ message: "Failed to create order items" })
        }

        orderItems.push(orderItem)

        // Update product stock
        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock_quantity: item.products.stock_quantity - item.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.product_id)

        if (stockError) {
          return res.status(500).json({ message: "Failed to update product stock" })
        }
      }

      // Clear user's cart
      const { error: clearCartError } = await supabase.from("cart").delete().eq("user_id", req.user.id)

      if (clearCartError) {
        console.error("Failed to clear cart:", clearCartError)
      }

      res.status(201).json({
        message: "Order created successfully",
        order: {
          ...order,
          order_items: orderItems,
          addresses: address,
        },
      })
    } catch (error) {
      console.error("Order creation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update order status (Admin only)
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  [body("status").isIn(["pending", "processing", "shipped", "delivered", "cancelled"])],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { status } = req.body

      const { data: order, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error || !order) {
        return res.status(404).json({ message: "Order not found or failed to update" })
      }

      res.json({ message: "Order status updated successfully", order })
    } catch (error) {
      console.error("Order status update error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

export default router
