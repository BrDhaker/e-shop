import supabase from "../config/supabase.js"

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData) {
      return res.status(401).json({ message: "User not found" })
    }

    // Check if user is active
    if (!userData.is_active) {
      return res.status(401).json({ message: "Account is deactivated" })
    }

    req.user = {
      ...userData,
      email_verified: user.email_confirmed_at ? true : false,
      supabase_user: user,
    }
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(403).json({ message: "Invalid token" })
  }
}

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      req.user = null
      return next()
    }

    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!userError && userData && userData.is_active) {
      req.user = {
        ...userData,
        email_verified: user.email_confirmed_at ? true : false,
        supabase_user: user,
      }
    } else {
      req.user = null
    }
  } catch (error) {
    req.user = null
  }

  next()
}

export { authenticateToken, requireAdmin, optionalAuth }
