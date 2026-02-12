import { DefaultSession } from "next-auth";

type UserRole = "CUSTOMER" | "ADMIN" | "GHOST";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole | undefined;
      isBlocked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    isBlocked?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    isBlocked?: boolean;
    provider?: string;
  }
}
