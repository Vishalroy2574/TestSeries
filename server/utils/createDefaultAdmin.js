import User from "../models/User.js";

export const createDefaultAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin";

    if (!email || !password) {
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return;
    }

    await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    console.log(`Default admin created with email: ${email}`);
  } catch (error) {
    console.error("Error creating default admin:", error.message);
  }
};

