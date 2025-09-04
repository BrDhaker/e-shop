import express from "express"
import { body, validationResult } from "express-validator"
import supabase from "../config/supabase.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Register new user
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").trim().isLength({ min: 1 }),
    body("lastName").trim().isLength({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password, firstName, lastName, phone } = req.body

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
          },
        },
      })

      if (error) {
        console.error("Registration error:", error)
        return res.status(400).json({ message: error.message })
      }

      if (data.user) {
        const { error: dbError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          is_active: true,
          email_verified: data.user.email_confirmed_at ? true : false,
          created_at: data.user.created_at,
        })

        if (dbError) {
          console.error("Database insert error:", dbError)
        }
      }

      res.status(201).json({
        message: data.user?.email_confirmed_at
          ? "Registration successful! You can now log in."
          : "Registration successful! Please check your email to verify your account before logging in.",
        user: {
          id: data.user?.id,
          email: data.user?.email,
          first_name: firstName,
          last_name: lastName,
          email_verified: data.user?.email_confirmed_at ? true : false,
        },
        requiresVerification: !data.user?.email_confirmed_at,
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

router.post("/resend-verification", [body("email").isEmail().normalizeEmail()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email } = req.body

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    })

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    res.json({ message: "Verification email sent successfully" })
  } catch (error) {
    console.error("Resend verification error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").exists()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({ message: error.message })
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (userError) {
      console.error("User data fetch error:", userError)
    }

    // Update last login
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", data.user.id)

    res.json({
      message: "Login successful",
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        first_name: userData?.first_name || data.user.user_metadata?.first_name,
        last_name: userData?.last_name || data.user.user_metadata?.last_name,
        phone: userData?.phone || data.user.user_metadata?.phone,
        role: userData?.role || "user",
        email_verified: data.user.email_confirmed_at ? true : false,
        created_at: data.user.created_at,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" })
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (error) {
      return res.status(401).json({ message: error.message })
    }

    res.json({ accessToken: data.session.access_token })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(401).json({ message: "Invalid refresh token" })
  }
})

router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      await supabase.auth.signOut()
    }

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/forgot-password", [body("email").isEmail().normalizeEmail()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email } = req.body

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL || "https://e-shop-irso.onrender.com"}/reset-password`,
    })

    if (error) {
      console.error("Password reset error:", error)
    }

    // Always return success for security
    res.json({ message: "If the email exists, a reset link has been sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/reset-password", [body("password").isLength({ min: 6 })], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { password } = req.body
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Authorization token required" })
    }

    // Set the session for this request
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ message: "Invalid or expired token" })
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    res.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(400).json({ message: "Invalid or expired reset token" })
  }
})

router.post("/verify-email", async (req, res) => {
  try {
    // This endpoint is mainly for compatibility
    // Supabase handles email verification automatically via email links
    res.json({ message: "Email verification is handled automatically by Supabase" })
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(400).json({ message: "Verification error" })
  }
})

router.post("/create-admin", async (req, res) => {
  try {
    const adminEmail = "admin@example.com"
    const adminPassword = "admin123"

    // First, try to sign up the admin user in Supabase auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          first_name: "Admin",
          last_name: "User",
        },
      },
    })

    if (signUpError && !signUpError.message.includes("already registered")) {
      console.error("Admin signup error:", signUpError)
      return res.status(400).json({ message: signUpError.message })
    }

    // Get or create the user in our database
    let userId = signUpData?.user?.id

    // If user already exists in Supabase auth, get their ID
    if (!userId) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find((user) => user.email === adminEmail)
      userId = existingUser?.id
    }

    if (userId) {
      // Insert or update in our users table
      const { error: dbError } = await supabase.from("users").upsert({
        id: userId,
        email: adminEmail,
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("Database upsert error:", dbError)
      }
    }

    res.json({
      message: "Admin user created successfully. You can now login with admin@example.com / admin123",
      adminEmail,
      adminPassword,
    })
  } catch (error) {
    console.error("Create admin error:", error)
    res.status(500).json({ message: "Server error creating admin user" })
  }
})

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user
    res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName").optional().trim().isLength({ min: 1 }),
    body("lastName").optional().trim().isLength({ min: 1 }),
    body("phone").optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { firstName, lastName, phone } = req.body
      const updateData = {}

      if (firstName) updateData.first_name = firstName
      if (lastName) updateData.last_name = lastName
      if (phone !== undefined) updateData.phone = phone
      updateData.updated_at = new Date().toISOString()

      const { data: user, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", req.user.id)
        .select("id, email, first_name, last_name, role, phone, created_at, updated_at")
        .single()

      if (error) {
        return res.status(500).json({ message: "Failed to update profile" })
      }

      res.json({ message: "Profile updated successfully", user })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

export default router
