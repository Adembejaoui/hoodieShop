import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Use DIRECT_URL for migrations (Accelerate doesn't support migrations)
    // Migrations need a direct connection to the database
    url: env("DIRECT_URL"),
  },
});
