import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function verifyAuth() {
  console.log("🔍 Verifying authentication setup...\n");

  try {
    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { username: "admin" },
    });

    if (!admin) {
      console.log("❌ Admin user not found. Please run: npm run prisma:seed");
      return;
    }

    console.log("✅ Admin user found:");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}\n`);

    // Test password verification
    const testPassword = "admin123";
    const isValid = await bcrypt.compare(testPassword, admin.password);

    if (isValid) {
      console.log("✅ Password verification works correctly");
      console.log(`   Test password "${testPassword}" matches stored hash\n`);
    } else {
      console.log("❌ Password verification failed");
      console.log("   The stored password hash may be incorrect\n");
    }

    // Check environment variables
    console.log("🔧 Environment variables:");
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || "❌ Not set"}`);
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set"}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}\n`);

    console.log("✅ Authentication setup verification complete!");
    console.log("\n📝 Test credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Error during verification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAuth();
