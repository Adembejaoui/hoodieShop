import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import nodemailer from "nodemailer";
import { applyRateLimit } from "@/lib/security/rate-limit";

// Zod validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Email sending function
async function sendWelcomeEmail(email: string, userName: string) {
  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}` 
    : "http://localhost:3000";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Hoodie Legends 🎉</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Welcome to Hoodie Legends!</h2>
        <p style="color: #4b5563;">Hi ${userName},</p>
        <p style="color: #4b5563;">Thank you for joining the Hoodie Legends community! We're thrilled to have you on board.</p>
        <p style="color: #4b5563;">Get ready to wear the power of anime with our exclusive hoodies and apparel.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop" style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Start Shopping</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">Hoodie Legends - Wear the Power of Anime</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Hoodie Legends <noreply@yourdomain.com>",
    to: email,
    subject: "Welcome to Hoodie Legends! 🎉",
    html: emailHtml,
  });
}

export async function POST(request: Request) {
  // Apply rate limiting for registration (prevent brute force)
  const rateLimitResult = await applyRateLimit(request, 'auth');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again in a minute." },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': '60',
        },
      }
    );
  }
  
  try {
    const body = await request.json();

    // Validate input with Zod
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (12 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    console.log("New user created:", user.email);

    // Send welcome email asynchronously (don't fail registration if email fails)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendWelcomeEmail(email, name);
        console.log("Welcome email sent to:", email);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    } else {
      console.log("SMTP not configured - skipping welcome email");
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
