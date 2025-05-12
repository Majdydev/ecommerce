import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export function validatePrismaSchema() {
  try {
    // Check if schema exists in the correct location
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    if (!fs.existsSync(schemaPath)) {
      console.error("Error: Prisma schema not found at:", schemaPath);
      return false;
    }

    // Validate schema
    try {
      execSync("npx prisma validate", { stdio: "inherit" });
      return true;
    } catch (error) {
      console.error("Error validating Prisma schema:", error);
      return false;
    }
  } catch (error) {
    console.error("Error in schema validation:", error);
    return false;
  }
}
