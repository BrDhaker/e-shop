const nodemailer = require("nodemailer")

// Create transporter using environment variables
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, use services like SendGrid, Mailgun, etc.
  return nodemailer.createTransporter({
    service: "gmail", // or your preferred service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  })
}

const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter()
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our E-commerce Store, ${firstName}!</h2>
          <p>Thank you for registering with us. Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${email}`)
    return true
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return false
  }
}

const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter()
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent to ${email}`)
    return true
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return false
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
}
