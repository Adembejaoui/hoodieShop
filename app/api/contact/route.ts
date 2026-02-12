import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/contact - Submit a contact message
export async function POST(request: NextRequest) {
  // Apply rate limiting for contact form
  const rateLimitResult = await applyRateLimit(request, 'contact');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
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
    const contentType = request.headers.get("content-type");
    let name, email, subject, message;

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      name = body.name;
      email = body.email;
      subject = body.subject;
      message = body.message;
    } else {
      // Handle form data
      const formData = await request.formData();
      name = formData.get("name") as string;
      email = formData.get("email") as string;
      subject = formData.get("subject") as string;
      message = formData.get("message") as string;
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create the contact message
    await withRetry(() => prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "NEW",
      },
    }));

    // Return success JSON (client-side form expects this)
    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// GET /api/contact - List contact messages (admin only)
export async function GET(request: NextRequest) {
  // Verify admin from session (middleware already validated)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden", message: "Admin access required" },
      { status: 403 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = status ? { status: status as any } : {};

    const [messages, total] = await Promise.all([
      withRetry(() => prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      })) as Promise<any[]>,
      withRetry(() => prisma.contactMessage.count({ where })) as Promise<number>,
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
