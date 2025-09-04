import express from "express"
import { authenticateToken } from "../middleware/auth.js"
import supabase from "../config/supabase.js"

const router = express.Router()

// Get user's wishlist
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const { data: wishlistItems, error } = await supabase
      .from("wishlist_items")
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          stock,
          category_id,
          categories (
            name
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(wishlistItems)
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({ error: "Failed to fetch wishlist" })
  }
})

// Add item to wishlist
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body
    const userId = req.user.id

    // Check if item already in wishlist
    const { data: existingItem } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product_id)
      .single()

    if (existingItem) {
      return res.status(400).json({ error: "Item already in wishlist" })
    }

    const { data: wishlistItem, error } = await supabase
      .from("wishlist_items")
      .insert({
        user_id: userId,
        product_id,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(wishlistItem)
  } catch (error) {
    console.error("Add to wishlist error:", error)
    res.status(500).json({ error: "Failed to add to wishlist" })
  }
})

// Remove item from wishlist
router.delete("/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user.id

    const { error } = await supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", productId)

    if (error) throw error

    res.json({ message: "Item removed from wishlist" })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).json({ error: "Failed to remove from wishlist" })
  }
})

export default router
