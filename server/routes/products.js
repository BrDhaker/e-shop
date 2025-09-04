import express from "express"
import { body, validationResult } from "express-validator"
import supabase from "../config/supabase.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all products with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query

    const offset = (page - 1) * limit

    let query = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        ),
        product_images (
          id,
          image_url,
          is_primary
        )
      `)
      .eq("is_active", true)

    // Apply filters
    if (category) {
      query = query.eq("category_id", category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (minPrice) {
      query = query.gte("price", minPrice)
    }

    if (maxPrice) {
      query = query.lte("price", maxPrice)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      return res.status(500).json({ message: "Failed to fetch products" })
    }

    res.json({
      products,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        ),
        product_images (
          id,
          image_url,
          is_primary
        )
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error || !product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ product })
  } catch (error) {
    console.error("Product fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new product (Admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("name").trim().isLength({ min: 1 }),
    body("description").optional().trim(),
    body("price").isFloat({ min: 0 }),
    body("stockQuantity").isInt({ min: 0 }),
    body("categoryId").isUUID(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, price, stockQuantity, categoryId, imageUrl } = req.body

      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name,
          description,
          price,
          stock_quantity: stockQuantity,
          category_id: categoryId,
          image_url: imageUrl,
        })
        .select()
        .single()

      if (error) {
        return res.status(500).json({ message: "Failed to create product" })
      }

      res.status(201).json({ message: "Product created successfully", product })
    } catch (error) {
      console.error("Product creation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update product (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    body("name").optional().trim().isLength({ min: 1 }),
    body("description").optional().trim(),
    body("price").optional().isFloat({ min: 0 }),
    body("stockQuantity").optional().isInt({ min: 0 }),
    body("categoryId").optional().isUUID(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { name, description, price, stockQuantity, categoryId, imageUrl, isActive } = req.body

      const updateData = { updated_at: new Date().toISOString() }

      if (name) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (price) updateData.price = price
      if (stockQuantity !== undefined) updateData.stock_quantity = stockQuantity
      if (categoryId) updateData.category_id = categoryId
      if (imageUrl !== undefined) updateData.image_url = imageUrl
      if (isActive !== undefined) updateData.is_active = isActive

      const { data: product, error } = await supabase.from("products").update(updateData).eq("id", id).select().single()

      if (error || !product) {
        return res.status(404).json({ message: "Product not found or failed to update" })
      }

      res.json({ message: "Product updated successfully", product })
    } catch (error) {
      console.error("Product update error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete product (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      return res.status(500).json({ message: "Failed to delete product" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Product deletion error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
