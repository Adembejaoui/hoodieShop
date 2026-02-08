# Authentication Documentation

This document covers the complete authentication implementation using NextAuth.js, Prisma, PostgreSQL, and Resend.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [Security Best Practices](#security-best-practices)
9. [Email Templates](#email-templates)

## Overview

The authentication system is built with:
- **NextAuth.js 4.24.13** - Authentication for Next.js
- **Prisma 7.3.0** - ORM for database interactions
- **PostgreSQL** - Database
- **Resend** - Email delivery service (Vercel-compatible)
- **React Email** - Beautiful email templates
- **Bcryptjs** - Password hashing
- **Zod** - Input validation

## Features

### Authentication Providers
- **Google OAuth** - Sign in with Google
- **Credentials Provider** - Email/password authentication

### Security Features
- JWT-based sessions with configurable expiration
- Secure password hashing (bcrypt with 12 salt rounds)
- CSRF protection
- Account linking for users with same email
- Secure HTTP-only cookies

### User Management
- User registration with validation
- Password reset via email
- Email verification workflow
- Role-based access (CUSTOMER, ADMIN)

### Email Features
- Welcome emails on registration
- Password reset emails
- Beautiful React Email templates
- Fallback to SMTP for development

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/hoodies?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-generate-with-openssl-rand-base64-32"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Resend - Recommended)
RESEND_API_KEY="re_your_resend_api_key_here"
EMAIL_FROM="onboarding@resend.dev"
```

### 3. Generate NextAuth Secret

```bash
# Linux/macOS
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 255 }))
```

### 4. Set Up Database

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (optional - for debugging)
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to test the authentication.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | Your app URL (e.g., http://localhost:3000) |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT encryption |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `RESEND_API_KEY` | No | Resend API key for emails |
| `EMAIL_FROM` | No | Sender email address |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts      # NextAuth handler
│   │   │   ├── register/
│   │   │   │   └── route.ts      # User registration
│   │   │   └── forgot-password/
│   │   │       └── route.ts      # Password reset
│   │   └── send-email/
│   │       └── route.ts          # Email API
│   └── auth/
│       ├── login/
│       │   └── page.tsx          # Login page
│       └── reset-password/
│           └── page.tsx          # Reset password page
├── components/
│   ├── auth/
│   │   ├── login-form.tsx       # Login form
│   │   ├── register-form.tsx     # Registration form
│   │   ├── protected-route.tsx   # Protected route wrapper
│   │   └── sign-out-button.tsx  # Sign out button
│   └── layout/
│       └── header.tsx            # Header with auth status
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── auth-utils.ts             # Auth utility functions
│   ├── prisma.ts                 # Prisma client
│   ├── resend.ts                 # Resend client
│   └── emails/
│       ├── welcome-email.tsx     # Welcome email template
│       └── password-reset-email.tsx
├── providers/
│   └── auth-provider.tsx         # Session provider
├── types/
│   └── next-auth.d.ts            # TypeScript definitions
└── middleware.ts                # Route protection
```

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/register` | POST | Register new user |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/send-email` | POST | Send custom email |

### Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User login page |
| Register | `/register` | User registration page |
| Reset Password | `/auth/reset-password` | Password reset page |

## Frontend Integration

### Using Session in Components

```tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div>
        <p>Signed in as: {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return <button onClick={() => signIn()}>Sign in</button>;
}
```

### Protected Route Component

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <h1>Protected Dashboard</h1>
    </ProtectedRoute>
  );
}
```

### Server-Side Session

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getServerSideProps() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
```

## Security Best Practices

### 1. Password Security
- Minimum 8 characters required
- Bcrypt with 12 salt rounds
- Never store plain text passwords

### 2. Session Security
- JWT tokens with expiration
- Secure, HTTP-only cookies
- CSRF protection enabled

### 3. Email Security
- Don't reveal if email exists in forgot password
- Token expiration (1 hour)
- Rate limiting on API endpoints

### 4. OAuth Security
- Account linking for existing users
- Provider account association
- Secure callback handling

### 5. Production Checklist
- [ ] Use HTTPS in production
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Monitor authentication logs
- [ ] Use Resend API key in production
- [ ] Configure proper email domain verification

## Email Templates

### Welcome Email

The welcome email is sent automatically after successful registration.

**Features:**
- Beautiful gradient design
- Responsive layout
- Clear CTA button
- Social media links

### Password Reset Email

Sent when users request a password reset.

**Features:**
- Clear reset button
- Expiration notice (1 hour)
- Fallback link option
- Security notice

### Custom Email API

Send custom emails via the `/api/send-email` endpoint:

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "type": "welcome",
    "data": {
      "userName": "John"
    }
  }'
```

## Troubleshooting

### Common Issues

#### 1. Prisma Client Not Generated
```bash
npx prisma generate
```

#### 2. Database Connection Error
Check your `DATABASE_URL` format:
```
postgresql://username:password@host:port/database?schema=public
```

#### 3. Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Ensure email domain is verified

#### 4. Google OAuth Not Working
- Verify Google Cloud Console settings
- Check redirect URIs match exactly
- Ensure client ID and secret are correct

#### 5. Session Not Persisting
- Check cookies are not blocked
- Verify `NEXTAUTH_SECRET` is set
- Ensure same-origin policy is satisfied

### Development Tips

1. Check Prisma Studio for database issues:
   ```bash
   npx prisma studio
   ```

2. View authentication logs:
   ```bash
   npm run dev
   ```

3. Test email in development without Resend:
   - Password reset links will be logged to console
   - Check terminal output for reset URLs

## License

MIT License
