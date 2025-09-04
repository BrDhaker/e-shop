import express from "express"
import { authenticateToken } from "../middleware/auth.js"
import supabase from "../config/supabase.js"
import Stripe from "stripe"

// PayPal SDK
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk"

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// PayPal client configuration
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
})

const ordersController = new OrdersController(paypalClient)

// Create Stripe checkout session
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body
    const userId = req.user.id

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 50 ? 0 : 9.99
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    // Create line items for Stripe
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name || item.products?.name,
          description: item.description || item.products?.description,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Add shipping as line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      })
    }

    // Add tax as line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax",
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    })

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      return_url: `${process.env.CLIENT_URL || "https://e-shop-irso.onrender.com"}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: userId,
        cart_items: JSON.stringify(cartItems),
        shipping_address: JSON.stringify(shippingAddress),
      },
    })

    res.send({ clientSecret: session.client_secret })
  } catch (error) {
    console.error("Stripe session creation error:", error)
    res.status(500).json({ error: "Failed to create checkout session" })
  }
})

// Create PayPal order
router.post("/paypal/orders", authenticateToken, async (req, res) => {
  try {
    const { cartItems } = req.body

    // Calculate total from cart items
    const total = cartItems.reduce((sum, item) => {
      const price = Number.parseFloat(item.products?.price || item.price)
      return sum + price * item.quantity
    }, 0)

    const collect = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: total.toFixed(2),
            },
          },
        ],
      },
      prefer: "return=minimal",
    }

    const { body, ...httpResponse } = await ordersController.createOrder(collect)

    const jsonResponse = JSON.parse(body)
    res.status(httpResponse.statusCode).json(jsonResponse)
  } catch (error) {
    console.error("Failed to create order:", error)
    if (error instanceof ApiError) {
      res.status(error.statusCode || 500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Failed to create order." })
    }
  }
})

// Capture PayPal payment
router.post("/paypal/orders/:orderID/capture", authenticateToken, async (req, res) => {
  try {
    const { orderID } = req.params
    const { cartItems, shippingAddress } = req.body
    const userId = req.user.id

    const collect = {
      id: orderID,
      prefer: "return=minimal",
    }

    const { body, ...httpResponse } = await ordersController.captureOrder(collect)
    const jsonResponse = JSON.parse(body)

    if (httpResponse.statusCode === 201) {
      // Process the order in our database
      const subtotal = cartItems.reduce((sum, item) => {
        const price = Number.parseFloat(item.products?.price || item.price)
        return sum + price * item.quantity
      }, 0)
      const shipping = subtotal >= 50 ? 0 : 9.99
      const tax = subtotal * 0.08
      const total = subtotal + shipping + tax

      // Create address record
      const { data: address, error: addressError } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          street_address: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
          is_default: false,
        })
        .select()
        .single()

      if (addressError) throw addressError

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: total.toFixed(2),
          status: "confirmed",
          payment_method: "paypal",
          payment_intent_id: orderID,
          shipping_address_id: address.id,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number.parseFloat(item.products?.price || item.price),
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError

      for (const item of cartItems) {
        // Get current stock
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .single()

        if (product) {
          const newStock = product.stock_quantity - item.quantity
          await supabase
            .from("products")
            .update({ stock_quantity: Math.max(0, newStock) })
            .eq("id", item.product_id)
        }
      }

      // Clear user's cart
      await supabase.from("cart").delete().eq("user_id", userId)
    }

    res.status(httpResponse.statusCode).json(jsonResponse)
  } catch (error) {
    console.error("Failed to capture order:", error)
    if (error instanceof ApiError) {
      res.status(error.statusCode || 500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Failed to capture order." })
    }
  }
})

// Get session status without authentication
router.get("/session-status", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id)

    if (session.status === "complete" && session.payment_status === "paid") {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("payment_intent_id", session.payment_intent)
        .single()

      if (existingOrder) {
        // Order already exists, return existing order info
        return res.send({
          status: session.status,
          customer_email: session.customer_details?.email || session.customer_email,
          orderId: existingOrder.id,
        })
      }

      // Get user ID from session metadata
      const userId = session.metadata.user_id
      const cartItems = JSON.parse(session.metadata.cart_items)
      const shippingAddress = JSON.parse(session.metadata.shipping_address)

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const shipping = subtotal >= 50 ? 0 : 9.99
      const tax = subtotal * 0.08
      const total = subtotal + shipping + tax

      // Create address record
      const { data: address, error: addressError } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          street_address: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
          is_default: false,
        })
        .select()
        .single()

      if (addressError) throw addressError

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: total.toFixed(2),
          status: "confirmed",
          payment_method: "stripe",
          payment_intent_id: session.payment_intent,
          shipping_address_id: address.id,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id || item.products?.id,
        quantity: item.quantity,
        price: Number.parseFloat(item.products?.price || item.price),
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError

      for (const item of cartItems) {
        const productId = item.product_id || item.products?.id

        // Get current stock
        const { data: product } = await supabase.from("products").select("stock_quantity").eq("id", productId).single()

        if (product) {
          const newStock = product.stock_quantity - item.quantity
          await supabase
            .from("products")
            .update({ stock_quantity: Math.max(0, newStock) })
            .eq("id", productId)
        }
      }

      // Clear user's cart
      await supabase.from("cart").delete().eq("user_id", userId)

      return res.send({
        status: session.status,
        customer_email: session.customer_details?.email || session.customer_email,
        orderId: order.id,
      })
    }

    res.send({
      status: session.status,
      customer_email: session.customer_details?.email || session.customer_email,
    })
  } catch (error) {
    console.error("Session status error:", error)
    res.status(500).json({ error: "Failed to retrieve session status" })
  }
})

// Official PayPal API routes
router.post("/api/orders", async (req, res) => {
  try {
    const { cart } = req.body

    const collect = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: "100.00", // This should be calculated from cart in real implementation
            },
          },
        ],
      },
      prefer: "return=minimal",
    }

    const { body, ...httpResponse } = await ordersController.createOrder(collect)
    const jsonResponse = JSON.parse(body)
    res.status(httpResponse.statusCode).json(jsonResponse)
  } catch (error) {
    console.error("Failed to create order:", error)
    res.status(500).json({ error: "Failed to create order." })
  }
})

router.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params

    const collect = {
      id: orderID,
      prefer: "return=minimal",
    }

    const { body, ...httpResponse } = await ordersController.captureOrder(collect)
    const jsonResponse = JSON.parse(body)
    res.status(httpResponse.statusCode).json(jsonResponse)
  } catch (error) {
    console.error("Failed to capture order:", error)
    res.status(500).json({ error: "Failed to capture order." })
  }
})

export default router
