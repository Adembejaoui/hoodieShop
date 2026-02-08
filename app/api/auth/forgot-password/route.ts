import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import crypto from "crypto";

async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string | null) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Hoodie Legends</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #4b5563;">Hi ${userName || "there"},</p>
        <p style="color: #4b5563;">You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #4b5563; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #4b5563; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">Hoodie Legends - Wear the Power of Anime</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Hoodie Legends <noreply@yourdomain.com>",
    to: email,
    subject: "Password Reset Request",
    html: emailHtml,
  });
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account exists, a password reset link will be sent" },
        { status: 200 }
      );
    }

    // Check if user signed up with Google OAuth (no password)
    const hasGoogleAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: "google",
      },
    });

    if (hasGoogleAccount) {
      return NextResponse.json(
        { message: "If an account exists, a password reset link will be sent" },
        { status: 200 }
      );
    }

    // Delete any existing reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires,
      },
    });

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}` 
      : "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send email using SMTP
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      try {
        await sendPasswordResetEmail(email, resetUrl, user.name);
        console.log("Password reset email sent to:", email);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Still return success to prevent email enumeration
      }
    } else {
      // Development mode - log the reset link
      console.log("Password reset link (development):", resetUrl);
    }

    return NextResponse.json(
      { message: "If an account exists, a password reset link will be sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
