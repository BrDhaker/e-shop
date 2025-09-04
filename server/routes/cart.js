import express from "express"
import { body, validationResult } from "express-validator"
import supabase from "../config/supabase.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get user's cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data: cartItems, error } = await supabase
      .from("cart")
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          stock_quantity,
          is_active
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(500).json({ message: "Failed to fetch cart" })
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + item.products.price * item.quantity
    }, 0)

    res.json({ cartItems, total })
  } catch (error) {
    console.error("Cart fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add item to cart
router.post(
  "/",
  authenticateToken,
  [body("productId").isUUID(), body("quantity").isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { productId, quantity } = req.body

      // Check if product exists and is active
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, stock_quantity, is_active")
        .eq("id", productId)
        .single()

      if (productError || !product || !product.is_active) {
        return res.status(404).json({ message: "Product not found or inactive" })
      }

      if (product.stock_quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" })
      }

      // Check if item already exists in cart
      const { data: existingItem, error: existingError } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("product_id", productId)
        .single()

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity

        if (product.stock_quantity < newQuantity) {
          return res.status(400).json({ message: "Insufficient stock" })
        }

        const { data: updatedItem, error: updateError } = await supabase
          .from("cart")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id)
          .select()
          .single()

        if (updateError) {
          return res.status(500).json({ message: "Failed to update cart" })
        }

        return res.json({ message: "Cart updated successfully", cartItem: updatedItem })
      } else {
        // Add new item
        const { data: cartItem, error: insertError } = await supabase
          .from("cart")
          .insert({
            user_id: req.user.id,
            product_id: productId,
            quantity,
          })
          .select()
          .single()

        if (insertError) {
          return res.status(500).json({ message: "Failed to add to cart" })
        }

        res.status(201).json({ message: "Item added to cart successfully", cartItem })
      }
    } catch (error) {
      console.error("Add to cart error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update cart item quantity
router.put("/:id", authenticateToken, [body("quantity").isInt({ min: 1 })], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { quantity } = req.body

    // Get cart item with product info
    const { data: cartItem, error: cartError } = await supabase
      .from("cart")
      .select(`
          *,
          products (
            stock_quantity,
            is_active
          )
        `)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single()

    if (cartError || !cartItem) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    if (!cartItem.products.is_active) {
      return res.status(400).json({ message: "Product is no longer available" })
    }

    if (cartItem.products.stock_quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" })
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from("cart")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return res.status(500).json({ message: "Failed to update cart item" })
    }

    res.json({ message: "Cart item updated successfully", cartItem: updatedItem })
  } catch (error) {
    console.error("Cart update error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove item from cart
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("cart").delete().eq("id", id).eq("user_id", req.user.id)

    if (error) {
      return res.status(500).json({ message: "Failed to remove cart item" })
    }

    res.json({ message: "Item removed from cart successfully" })
  } catch (error) {
    console.error("Cart removal error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Clear entire cart
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.from("cart").delete().eq("user_id", req.user.id)

    if (error) {
      return res.status(500).json({ message: "Failed to clear cart" })
    }

    res.json({ message: "Cart cleared successfully" })
  } catch (error) {
    console.error("Cart clear error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
