import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const email = process.env.SEED_ADMIN_EMAIL || "admin@attendance.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "admin123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      process.exit(0);
    }

    await User.create({
      name: "System Admin",
      email,
      password,
      role: "admin",
      department: "Administration",
    });

    console.log(`Admin created: ${email} / ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
