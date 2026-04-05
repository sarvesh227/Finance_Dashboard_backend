const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/helpers");
const userService = require("../services/user.service");

/**
 * GET /api/users/me
 * Authenticated: Get own profile
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getMyProfile(req.user.id);
  return successResponse(res, { user });
});

/**
 * GET /api/users
 * Admin: List all users with pagination
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  return successResponse(res, result);
});

/**
 * GET /api/users/:id
 * Admin: Get a single user by ID
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, { user });
});

/**
 * POST /api/users
 * Admin: Create a new user with any role
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await userService.createUser({ name, email, password, role });
  return successResponse(res, { user }, "User created successfully.", 201);
});

/**
 * PATCH /api/users/:id/role
 * Admin: Update a user's role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await userService.updateUserRole(req.params.id, role);
  return successResponse(res, { user }, "User role updated.");
});

/**
 * PATCH /api/users/:id/status
 * Admin: Activate or deactivate a user
 */
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userService.setUserActiveStatus(req.params.id, isActive);
  const msg = isActive ? "User activated." : "User deactivated.";
  return successResponse(res, { user }, msg);
});

module.exports = {
  getMyProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  setUserActiveStatus,
};
