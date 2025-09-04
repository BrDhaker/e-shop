import express from "express"
import { authenticateToken } from "../middleware/auth.js"
import supabase from "../config/supabase.js"

const router = express.Router()

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        *,
        users (
          first_name,
          last_name
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get average rating
    const { data: avgData } = await supabase.from("reviews").select("rating").eq("product_id", productId)

    const averageRating =
      avgData.length > 0 ? avgData.reduce((sum, review) => sum + review.rating, 0) / avgData.length : 0

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: avgData.length,
    })
  } catch (error) {
    console.error("Get reviews error:", error)
    res.status(500).json({ error: "Failed to fetch reviews" })
  }
})

// Add a review
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body
    const userId = req.user.id

    // Check if user has purchased this product
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        *,
        orders!inner (
          user_id,
          status
        )
      `)
      .eq("product_id", product_id)
      .eq("orders.user_id", userId)
      .eq("orders.status", "delivered")

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "You can only review products you have purchased" })
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", product_id)
      .eq("user_id", userId)
      .single()

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this product" })
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        product_id,
        user_id: userId,
        rating,
        comment,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(review)
  } catch (error) {
    console.error("Add review error:", error)
    res.status(500).json({ error: "Failed to add review" })
  }
})

// Update a review
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user.id

    const { data: review, error } = await supabase
      .from("reviews")
      .update({ rating, comment })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    if (!review) {
      return res.status(404).json({ error: "Review not found" })
    }

    res.json(review)
  } catch (error) {
    console.error("Update review error:", error)
    res.status(500).json({ error: "Failed to update review" })
  }
})

// Delete a review
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { error } = await supabase.from("reviews").delete().eq("id", id).eq("user_id", userId)

    if (error) throw error

    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Delete review error:", error)
    res.status(500).json({ error: "Failed to delete review" })
  }
})

export default router
