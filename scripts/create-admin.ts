import "dotenv/config";
import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> <password> [name] [role]");
    console.error("  role: SUPER_ADMIN | ADMIN (default: SUPER_ADMIN)");
    process.exit(1);
  }

  const [email, password, name = "Admin", role = "SUPER_ADMIN"] = args;

  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
    console.error("Invalid role. Must be SUPER_ADMIN or ADMIN");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const dbName = new URL(process.env.DATABASE_URL.replace("mongodb+srv://", "https://"))
      .pathname.slice(1).split("?")[0] || "hyi-broker";
    const db = client.db(dbName);
    const admins = db.collection("admins");

    // Check if admin already exists
    const existing = await admins.findOne({ email });
    if (existing) {
      console.error(`Admin with email "${email}" already exists`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create admin
    const now = new Date();
    const result = await admins.insertOne({
      name,
      email,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    });

    console.log("✅ Admin created successfully!");
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role}`);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createAdmin();
