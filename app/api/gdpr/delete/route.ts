import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Email sending function
async function sendDeletionConfirmationEmail(email: string, userName: string) {
  const baseUrl = process.env.NEXTAUTH_URL 
    ? String(process.env.NEXTAUTH_URL) 
    : 'http://localhost:3000';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const emailFrom = process.env.EMAIL_FROM || "Hoodie Legends <noreply@yourdomain.com>";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Account Deletion Request</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
        <p style="color: #4b5563;">We have received your request to delete your account and all associated personal data.</p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">Your account will be permanently deleted within 30 days.</p>
        </div>

        <p style="color: #4b5563;">If you did not request this deletion, please contact us immediately at support@hoodielegends.com.</p>
        
        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
          Hoodie Legends - Wear the Power of Anime<br>
          This is an automated message, please do not reply directly.
        </p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: "Account Deletion Request Received - Hoodie Legends",
    html: emailHtml,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to request account deletion' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find user by ID (from session)
    const user = await withRetry(() => prisma.user.findUnique({
      where: { id: userId },
    })) as { id: string; email: string | null; name: string | null } | null;

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Anonymize user data (preserve account for legal compliance but remove personal data)
    const anonymizedName = `Deleted User ${user.id.slice(-6)}`;
    
    await withRetry(() => prisma.user.update({
      where: { id: user.id },
      data: {
        name: anonymizedName,
        email: `deleted-${user.id}@anonymized.local`,
        phone: null,
        image: null,
        isBlocked: true,
      },
    }));

    // Send confirmation email
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const userEmail = user.email || '';
        await sendDeletionConfirmationEmail(userEmail, user.name || 'Customer');
      } catch (emailError) {
        // Email failed silently - deletion still proceeds
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your account has been marked for deletion. You will receive a confirmation email.',
    });
  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to process deletion request. Please try again later.' },
      { status: 500 }
    );
  }
}
