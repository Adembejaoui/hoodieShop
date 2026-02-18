import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

type UserRole = "CUSTOMER" | "ADMIN" | "GHOST";

// Detect if we're in production
const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  // No adapter when using JWT strategy with OAuth - we handle user creation manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
          access_type: "offline",
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
          // Check if user exists but was created via OAuth (no password)
          const existingUser = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (existingUser && !existingUser.password) {
            throw new Error("This account was created via Google. Please sign in with Google instead.");
          }
          throw new Error("Invalid credentials");
        }

        if (user.isBlocked) {
          throw new Error("Your account has been blocked. Please contact support.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role as UserRole | undefined,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  // Configure cookies for production (HTTPS)
  cookies: {
    sessionToken: {
      name: `${isProduction ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: isProduction ? undefined : undefined,
      },
    },
    callbackUrl: {
      name: `${isProduction ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${isProduction ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // First login with Google OAuth
      if (user && account?.provider === "google") {
        console.log("[JWT Callback] Google OAuth login for:", user.email);
        try {
          // Create or get user from database
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, isBlocked: true, role: true },
          });
          
          console.log("[JWT Callback] Found existing user:", !!dbUser);
          
          if (!dbUser) {
            // Create new user for Google OAuth
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: "CUSTOMER",
              },
              select: { id: true, isBlocked: true, role: true },
            });
            console.log("[JWT Callback] Created new user:", dbUser.id);
          }
          
          // Ensure account is linked (create if doesn't exist)
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: dbUser.id,
              provider: account.provider,
            },
          });
          
          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token as string | null | undefined,
                refresh_token: account.refresh_token as string | null | undefined,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token as string | null | undefined,
              },
            });
            console.log("[JWT Callback] Created account link");
          }
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isBlocked = dbUser.isBlocked;
            console.log("[JWT Callback] Token set with user ID:", token.id);
          }
          token.provider = account.provider;
        } catch (error) {
          console.error("[JWT Callback] Error:", error);
        }
      } else if (user) {
        // Credentials provider - user object already has the role
        token.id = user.id;
        token.role = user.role;
        token.provider = "credentials";
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      
      // On subsequent calls, refresh user data from database
      if (!user && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isBlocked: true, role: true },
        });
        if (dbUser) {
          token.isBlocked = dbUser.isBlocked;
          if (dbUser.role) {
            token.role = dbUser.role;
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("[Session Callback] Token ID:", token.id);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.isBlocked = token.isBlocked as boolean;
        console.log("[Session Callback] Session user ID:", session.user.id);
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("[SignIn Callback] Provider:", account?.provider, "Email:", user.email);
      // For Google OAuth, check if user is blocked
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { isBlocked: true },
        });
        
        // If user exists and is blocked, deny access
        if (existingUser?.isBlocked) {
          console.log("[SignIn Callback] User is blocked");
          return "/blocked";
        }
        
        console.log("[SignIn Callback] Allowing sign-in");
        // Allow sign-in - user creation happens in jwt callback
        return true;
      }
      
      // For credentials provider, the authorize callback already handled validation
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      // User creation logging (consider using a proper logging service in production)
    },
    async signIn({ user, isNewUser }) {
      // Sign in logging (consider using a proper logging service in production)
    },
  },
  debug: process.env.NODE_ENV === "development",
};
