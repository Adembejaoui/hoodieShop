import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

type UserRole = "CUSTOMER" | "ADMIN" | "GHOST";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
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
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.provider = account?.provider;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole | undefined;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { 
        user: user?.email, 
        account: account?.provider,
        profile: profile 
      });
      
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
          console.log("New Google user created:", user.email);
        } else if (existingUser.accounts.length === 0) {
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
          console.log("Google account linked to existing user:", user.email);
        } else {
          // User already has Google account linked
          console.log("User already has Google account:", user.email);
        }
      }
      
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      console.log("New user created:", user.email);
    },
    async signIn({ user, account, isNewUser }) {
      console.log("User signed in:", { user: user?.email, provider: account?.provider, isNewUser });
    },
  },
  debug: process.env.NODE_ENV === "development",
};
