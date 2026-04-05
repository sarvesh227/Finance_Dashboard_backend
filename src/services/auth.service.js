const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { sanitizeUser } = require("../utils/helpers");

/**
 * Registers a new user. Default role is VIEWER.
 * Only ADMIN can assign a non-default role (handled at route level).
 */
const registerUser = async ({ name, email, password, role = "VIEWER" }) => {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("A user with this email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { token, user: sanitizeUser(user) };
};

/**
 * Authenticates a user and returns a signed JWT.
 */
const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated. Contact an administrator.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { token, user: sanitizeUser(user) };
};

module.exports = { registerUser, loginUser };
