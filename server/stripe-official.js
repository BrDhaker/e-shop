// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.
// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const express = require("express")
const app = express()
app.use(express.static("public"))

const YOUR_DOMAIN = "http://localhost:3000"

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        price: "{{PRICE_ID}}",
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
  })

  res.send({ clientSecret: session.client_secret })
})

app.get("/session-status", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id)

  res.send({
    status: session.status,
    customer_email: session.customer_details.email,
  })
})

app.listen(4242, () => console.log("Running on port 4242"))
