
import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Load your project environment variables first.",
  );
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.$queryRaw`
    SELECT
      table_name,
      column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN (
        'GiftGuestbook',
        'GiftWebsite',
        'GiftWish'
      )
    ORDER BY table_name, ordinal_position
  `;

  console.log("Guestbook-related database columns:");
  console.table(result);
}

main()
  .catch((error) => {
    console.error("Guestbook SQL check failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
