"use client"

import { useState } from "react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

// Renders errors or successfull transactions on the screen.
function Message({ content }) {
  return <p className="text-sm text-gray-600 mt-2">{content}</p>
}

function PayPalButton({ cartItems, shippingAddress, onSuccess, onError }) {
  const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "demo_client_id",
    "enable-funding": "venmo",
    "buyer-country": "US",
    currency: "USD",
    components: "buttons",
  }

  const [message, setMessage] = useState("")

  if (!initialOptions["client-id"] || initialOptions["client-id"] === "demo_client_id") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800 text-sm">
          PayPal Client ID is not configured. Please set VITE_PAYPAL_CLIENT_ID or NEXT_PUBLIC_PAYPAL_CLIENT_ID
          environment variable.
        </p>
        <p className="text-red-600 text-xs mt-1">Current value: {initialOptions["client-id"]}</p>
      </div>
    )
  }

  return (
    <div className="paypal-button-container">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          }}
          createOrder={async () => {
            try {
              const response = await fetch("/api/payments/paypal/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({
                  cartItems: cartItems.map((item) => ({
                    product_id: item.product_id || item.products?.id,
                    quantity: item.quantity,
                    price: item.products?.price || item.price,
                  })),
                  shippingAddress: shippingAddress,
                }),
              })

              const orderData = await response.json()

              if (orderData.id) {
                return orderData.id
              } else {
                const errorDetail = orderData?.details?.[0]
                const errorMessage = errorDetail
                  ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                  : JSON.stringify(orderData)

                throw new Error(errorMessage)
              }
            } catch (error) {
              console.error(error)
              setMessage(`Could not initiate PayPal Checkout...${error}`)
              onError?.(error)
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const response = await fetch(`/api/payments/paypal/orders/${data.orderID}/capture`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              })

              const orderData = await response.json()

              const errorDetail = orderData?.details?.[0]

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart()
              } else if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`)
              } else {
                const transaction = orderData.purchase_units[0].payments.captures[0]
                setMessage(
                  `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`,
                )
                console.log("Capture result", orderData, JSON.stringify(orderData, null, 2))

                onSuccess?.({
                  success: true,
                  paymentId: transaction.id,
                  orderId: orderData.orderId || data.orderID,
                })
              }
            } catch (error) {
              console.error(error)
              setMessage(`Sorry, your transaction could not be processed...${error}`)
              onError?.(error)
            }
          }}
          onError={(error) => {
            console.error("PayPal error:", error)
            setMessage(`PayPal error: ${error}`)
            onError?.(error)
          }}
          onCancel={() => {
            setMessage("Payment was cancelled")
          }}
        />
      </PayPalScriptProvider>
      <Message content={message} />
    </div>
  )
}

export default PayPalButton
