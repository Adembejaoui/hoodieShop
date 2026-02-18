import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface EmailRequest {
  to: string;
  type: "welcome" | "test" | "contact_reply";
  data?: {
    userName?: string;
    subject?: string;
    message?: string;
  };
}

export async function POST(request: Request) {
  try {
    // Validate request body
    const body: EmailRequest = await request.json();

    if (!body.to || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: to and type" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: "Email service is not configured. Please set SMTP environment variables." },
        { status: 500 }
      );
    }

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

    const baseUrl = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}` 
      : "http://localhost:3000";

    let subject: string;
    let emailHtml: string;

    switch (body.type) {
      case "welcome":
        subject = "Welcome to Hoodiz Tunisia! \uD83C\uDDF9\uD83C\uDDF3";
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/logoDark.png" alt="Hoodiz Tunisia" style="height: 60px; margin-bottom: 10px;" />
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Welcome to Hoodiz Tunisia!</h2>
              <p style="color: #4b5563;">Hi ${body.data?.userName || "there"},</p>
              <p style="color: #4b5563;">Thank you for joining the Hoodiz Tunisia community! We're thrilled to have you on board.</p>
              <p style="color: #4b5563;">Discover unique designs across anime, gaming, and urban styles - quality clothing delivered across Tunisia.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/shop" style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #3b82f6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Start Shopping</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Hoodiz Tunisia - Premium Hoodies & Streetwear</p>
            </div>
          </body>
          </html>
        `;
        break;
      case "test":
        subject = "Test Email from Hoodiz Tunisia";
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/logoDark.png" alt="Hoodiz Tunisia" style="height: 60px; margin-bottom: 10px;" />
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Test Email</h2>
              <p style="color: #4b5563;">This is a test email from Hoodiz Tunisia!</p>
              <p style="color: #4b5563;">If you received this, your email system is working correctly.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Hoodiz Tunisia - Premium Hoodies & Streetwear</p>
            </div>
          </body>
          </html>
        `;
        break;
      case "contact_reply":
        subject = `Re: ${body.data?.subject || "Contact Form"}`;
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/logoDark.png" alt="Hoodiz Tunisia" style="height: 60px; margin-bottom: 10px;" />
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Reply to Your Message</h2>
              <p style="color: #4b5563;">Hi ${body.data?.userName || "there"},</p>
              <p style="color: #4b5563;">Thank you for contacting us! Here is our response:</p>
              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #1f2937; white-space: pre-wrap;">${body.data?.message || ""}</p>
              </div>
              <p style="color: #4b5563;">If you have any further questions, feel free to reply to this email.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Hoodiz Tunisia - Premium Hoodies & Streetwear</p>
            </div>
          </body>
          </html>
        `;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Hoodiz Tunisia <noreply@hoodiz.tn>",
      to: body.to,
      subject,
      html: emailHtml,
    });

    console.log("Email sent successfully to:", body.to);

    return NextResponse.json(
      { 
        success: true, 
        message: `Email sent successfully to ${body.to}`,
        type: body.type 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Email sending error:", error);

    // Handle specific Nodemailer errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid login")) {
        return NextResponse.json(
          { error: "Email authentication failed. Please check SMTP credentials." },
          { status: 500 }
        );
      }
      if (error.message.includes("Connection timeout")) {
        return NextResponse.json(
          { error: "Email server connection timeout. Please try again later." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: "Email API is working. Use POST to send emails.",
    usage: {
      method: "POST",
      body: {
        to: "user@example.com",
        type: "welcome",
        data: {
          userName: "Optional user name"
        }
      }
    },
    configRequired: {
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: "587",
      SMTP_USER: "your-email@gmail.com",
      SMTP_PASS: "your-app-password",
      EMAIL_FROM: "Hoodiz Tunisia <noreply@hoodiz.tn>"
    }
  });
}
