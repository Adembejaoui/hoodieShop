import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

type UserRole = "CUSTOMER" | "ADMIN" | "GHOST";

// Detect if we're in production
const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
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
    async jwt({ token, user, account }) {
      // First login - fetch role from database
      if (user && account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, isBlocked: true, role: true },
        });
        
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.isBlocked = dbUser.isBlocked;
        } else {
          token.id = user.id;
          token.role = "CUSTOMER";
          token.isBlocked = false;
        }
        token.provider = account.provider;
      } else if (user) {
        // Credentials provider - user object already has the role
        token.id = user.id;
        token.role = user.role;
        token.provider = "credentials";
      } else {
        // Token refresh - fetch fresh user data from database
        if (token.id) {
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
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.isBlocked = token.isBlocked as boolean;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      let userRole: string | undefined | null;
      
      if (account?.provider === "google") {
        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            accounts: {
              where: { provider: "google" }
            }
          }
        });
        
        if (!existingUser) {
          // Create new user from Google OAuth
          await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              image: user.image,
              role: "CUSTOMER",
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              }
            },
          });
          userRole = "CUSTOMER";
        } else {
          // Fetch fresh user data from database to get updated role and isBlocked status
          const freshUser = await prisma.user.findUnique({
            where: { id: existingUser.id },
            select: { isBlocked: true, role: true },
          });
          
          if (!freshUser) {
            // User doesn't exist anymore, allow sign in to proceed (will create new user)
            return true;
          }
          
          // Check if user is blocked using fresh data
          if (freshUser.isBlocked) {
            // Redirect to blocked page instead of returning false
            return "/blocked";
          }
          
          userRole = freshUser.role || existingUser.role;
          
          if (existingUser.accounts.length === 0) {
            // User exists but no Google account linked - link it
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              }
            });
          }
        }
      } else {
        // For credentials provider, user role is set in authorize callback
        userRole = user.role;
      }
      
      // Redirect all successful OAuth sign-ins to shop
      if (account?.provider !== "credentials") {
        return "/shop";
      }
      
      return true;
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
