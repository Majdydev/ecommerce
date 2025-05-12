import fs from "fs";
import path from "path";

export function checkEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  const envExamplePath = path.join(process.cwd(), ".env.example");

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.warn(
      "Warning: .env file not found. Creating from example if available."
    );

    // If .env.example exists, copy it to .env
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log("Created .env file from .env.example");
    } else {
      // Create minimal .env file with required variables
      const minimalEnv = `DATABASE_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=generate_a_secure_secret_key
NEXTAUTH_URL=http://localhost:3000`;

      fs.writeFileSync(envPath, minimalEnv);
      console.log(
        "Created minimal .env file. Please update with your actual credentials."
      );
    }
  }

  return true;
}
