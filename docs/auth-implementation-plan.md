# NextAuth Implementation Plan

## Overview

This document outlines the complete NextAuth.js authentication implementation for the hoodieJustAnime e-commerce project.

## Architecture

```mermaid
flowchart TB
    subgraph Client
        UI[UI Components]
        Form[Login Form]
        Button[Social Login Buttons]
    end
    
    subgraph Providers
        Google[Google Provider]
        Credentials[Credentials Provider]
    end
    
    subgraph NextAuth
        Config[auth.ts Config]
        Route[API Route Handler]
        Session[Session Manager]
        Adapter[Prisma Adapter]
    end
    
    subgraph Database
        User[User Model]
        Account[Account Model]
        Session[Session Model]
    end
    
    subgraph Protection
        Middleware[Route Middleware]
        Protected[Protected Components]
    end
    
    UI --> Form
    UI --> Button
    Form --> Credentials
    Button --> Google
    Google --> Route
    Credentials --> Route
    Route --> Config
    Config --> Adapter
    Adapter --> Database
    Session --> Middleware
    Middleware --> Protected
```

## Tech Stack

- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.3
- **NextAuth.js**: 4.24.13
- **Prisma**: 7.3.0
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with Prisma Adapter

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hoodies?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Google OAuth (if using Google provider)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (if using GitHub provider)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Implementation Steps

### 1. Type Definitions (`types/next-auth.d.ts`)

```typescript
import "next-auth";
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: "CUSTOMER" | "ADMIN" | "GHOST";
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: "CUSTOMER" | "ADMIN" | "GHOST";
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
    role?: "CUSTOMER" | "ADMIN" | "GHOST";
  }
}
```

### 2. NextAuth Configuration (`lib/auth.ts`)

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      console.log("New user created:", user.email);
    },
  },
  debug: process.env.NODE_ENV === "development",
};
```

### 3. API Route Handler (`app/api/auth/[...nextauth]/route.ts`)

```typescript
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 4. Session Provider (`providers/auth-provider.tsx`)

```typescript
"use client";

import { SessionProvider } from "next-auth/react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 5. Updated Login Form (`components/login-form.tsx`)

```typescript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
          disabled={isLoading}
        />
      </Field>
      
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
        />
      </Field>
      
      <Field>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </Field>
      
      <FieldDescription className="text-center">Or continue with</FieldDescription>
      
      <Field>
        <Button
          variant="outline"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </Field>
      
      <FieldDescription className="text-center">
        Don't have an account?{" "}
        <a href="/register" className="underline underline-offset-4">
          Sign up
        </a>
      </FieldDescription>
    </form>
  );
}
```

### 6. Protected Route Component (`components/auth/protected-route.tsx`)

```typescript
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"CUSTOMER" | "ADMIN" | "GHOST">;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role!)) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
```

### 7. Middleware (`middleware.ts`)

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes protection
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Protected API routes
    if (pathname.startsWith("/api") && pathname.includes("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)",
  ],
};
```

### 8. Auth Utility Functions (`lib/auth-utils.ts`)

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  return user;
}

export async function getCurrentUserStrict() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

export function checkRole(userRole: string | undefined, requiredRoles: string[]) {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}
```

### 9. Updated Layout (`app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hoodies - Anime Merchandise",
  description: "Premium anime hoodies and merchandise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 10. Register API Route (`app/api/auth/register/route.ts`)

```typescript
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
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
```

### 11. Sign Out Component (`components/auth/sign-out-button.tsx`)

```typescript
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SignOutButton({ children }: { children?: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children || "Sign out"}
    </Button>
  );
}
```

## Authentication Flow

### User Registration Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Login Form
    participant N as NextAuth
    participant P as Prisma
    participant D as Database
    
    U->>F: Fill registration form
    F->>API: POST /api/auth/register
    API->>P: Check existing user
    P->>D: Query users
    D-->>P: User exists?
    P-->>API: No user found
    API->>API: Hash password
    API->>P: Create user
    P->>D: Insert user
    D-->>P: User created
    P-->>API: User object
    API-->>F: Success response
    F->>N: Redirect to login
```

### User Login Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Login Form
    participant N as NextAuth
    participant P as Prisma
    participant D as Database
    
    U->>F: Enter credentials
    F->>N: signIn('credentials')
    N->>P: Validate credentials
    P->>D: Find user by email
    D-->>P: User found
    P->>P: Compare password hash
    P-->>N: Password valid
    N->>N: Create JWT token
    N->>N: Create session
    N-->>F: Session created
    F->>U: Redirect to home
```

### Protected Route Access
```mermaid
sequenceDiagram
    participant U as User
    participant M as Middleware
    participant S as Session
    participant P as Page
    
    U->>M: Access protected route
    M->>S: Check session token
    S-->>M: Token valid
    M->>M: Check role
    M-->>P: Allow access
    P-->>U: Render protected content
```

## Security Best Practices

### 1. Password Security
- Always hash passwords using bcrypt with appropriate salt rounds (12)
- Never store plain text passwords
- Enforce minimum password length (8+ characters)

### 2. Session Management
- Use JWT tokens with appropriate expiration (30 days max)
- Implement secure session cookie settings
- Rotate secrets periodically

### 3. API Security
- Validate all inputs on server-side
- Use proper error handling (don't expose internal errors)
- Rate limit authentication endpoints
- Use HTTPS in production

### 4. OAuth Security
- Validate state parameter for OAuth flows
- Use PKCE for OAuth 2.0 security
- Limit OAuth scopes to minimum required
- Store OAuth tokens securely

### 5. Route Protection
- Use middleware for route-level protection
- Implement role-based access control
- Validate sessions on API routes
- Handle authentication errors gracefully

### 6. Environment Variables
- Never commit secrets to version control
- Use different secrets for development and production
- Rotate compromised secrets immediately
- Use strong, random secrets (32+ characters)

## Implementation Checklist

- [x] Analyze project structure and requirements
- [ ] Create environment configuration file (.env.example)
- [ ] Update NextAuth type definitions (types/next-auth.d.ts)
- [ ] Create NextAuth configuration file (lib/auth.ts)
- [ ] Create NextAuth API route handler (app/api/auth/[...nextauth]/route.ts)
- [ ] Update Prisma schema with any missing fields
- [ ] Create session provider wrapper (providers/auth-provider.tsx)
- [ ] Update root layout to include session provider (app/layout.tsx)
- [ ] Update login form to integrate with NextAuth (components/login-form.tsx)
- [ ] Create protected route component (components/auth/protected-route.tsx)
- [ ] Add Google provider configuration
- [ ] Add Credential provider with password hashing
- [ ] Create middleware for route protection (middleware.ts)
- [ ] Create auth utility functions (lib/auth-utils.ts)
- [ ] Create registration API route (app/api/auth/register/route.ts)
- [ ] Create sign out component (components/auth/sign-out-button.tsx)
- [ ] Test authentication flow
- [ ] Document auth flow and best practices

## Troubleshooting Common Issues

### Issue: Session not persisting
**Solution**: Ensure middleware is properly configured and session provider is wrapped around the app.

### Issue: Google OAuth not working
**Solution**: 
1. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
2. Add authorized redirect URIs in Google Cloud Console
3. Enable Google+ API if required

### Issue: Credentials provider not validating
**Solution**:
1. Check password hashing (use bcrypt)
2. Verify user exists in database
3. Ensure email uniqueness constraint

### Issue: Role not appearing in session
**Solution**: Ensure JWT and session callbacks are properly implemented in auth options.
