const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { sanitizeUser, parsePagination } = require("../utils/helpers");

/**
 * Returns a paginated list of all users (Admin only).
 */
const getAllUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    users: users.map(sanitizeUser),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Fetches a single user by ID.
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) throw new AppError("User not found.", 404);
  return sanitizeUser(user);
};

/**
 * Admin creates a new user with any role.
 */
const createUser = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("A user with this email already exists.", 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: role || "VIEWER" },
  });

  return sanitizeUser(user);
};

/**
 * Admin updates a user's role.
 */
const updateUserRole = async (id, role) => {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) throw new AppError("User not found.", 404);

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { role },
  });

  return sanitizeUser(updated);
};

/**
 * Admin activates or deactivates a user.
 */
const setUserActiveStatus = async (id, isActive) => {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) throw new AppError("User not found.", 404);

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { isActive },
  });

  return sanitizeUser(updated);
};

/**
 * Returns the profile of the currently authenticated user.
 */
const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found.", 404);
  return sanitizeUser(user);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  setUserActiveStatus,
  getMyProfile,
};
