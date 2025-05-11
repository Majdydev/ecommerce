// Run this script with: node prisma/migrate.js

const { execSync } = require("child_process");
const path = require("path");

console.log("Starting Prisma migration process...");

try {
  // Generate Prisma client based on the schema
  console.log("\n1. Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // Push the schema changes to the database
  console.log("\n2. Pushing schema changes to database...");
  execSync("npx prisma db push", { stdio: "inherit" });

  console.log("\n✅ Migration completed successfully!");
  console.log(
    "\nNow restart your development server for the changes to take effect."
  );
} catch (error) {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
}
