import express from "express"
import { body, validationResult } from "express-validator"
import supabase from "../config/supabase.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all categories
router.get("/", async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select(`
        *,
        products!inner(count)
      `)
      .order("name")

    if (error) {
      return res.status(500).json({ message: "Failed to fetch categories" })
    }

    res.json({ categories })
  } catch (error) {
    console.error("Categories fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single category by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const { data: category, error } = await supabase.from("categories").select("*").eq("id", id).single()

    if (error || !category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json({ category })
  } catch (error) {
    console.error("Category fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new category (Admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [body("name").trim().isLength({ min: 1 }), body("description").optional().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, imageUrl } = req.body

      const { data: category, error } = await supabase
        .from("categories")
        .insert({
          name,
          description,
          image_url: imageUrl,
        })
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          return res.status(400).json({ message: "Category name already exists" })
        }
        return res.status(500).json({ message: "Failed to create category" })
      }

      res.status(201).json({ message: "Category created successfully", category })
    } catch (error) {
      console.error("Category creation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update category (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [body("name").optional().trim().isLength({ min: 1 }), body("description").optional().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { name, description, imageUrl } = req.body

      const updateData = { updated_at: new Date().toISOString() }

      if (name) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (imageUrl !== undefined) updateData.image_url = imageUrl

      const { data: category, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error || !category) {
        if (error?.code === "23505") {
          return res.status(400).json({ message: "Category name already exists" })
        }
        return res.status(404).json({ message: "Category not found or failed to update" })
      }

      res.json({ message: "Category updated successfully", category })
    } catch (error) {
      console.error("Category update error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete category (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Check if category has products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1)

    if (productsError) {
      return res.status(500).json({ message: "Failed to check category usage" })
    }

    if (products && products.length > 0) {
      return res.status(400).json({ message: "Cannot delete category with existing products" })
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      return res.status(500).json({ message: "Failed to delete category" })
    }

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Category deletion error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
