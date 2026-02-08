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
