import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        "ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env"
      );

      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    // Create admin
    const admin = await User.create({
      name: "MockGen Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("=================================");
    console.log("Admin account created successfully");
    console.log("=================================");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error(
      "Create Admin Error:",
      error
    );

    process.exit(1);
  }
};

createAdmin();