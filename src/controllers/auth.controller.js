const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/helpers");
const authService = require("../services/auth.service");

/**
 * POST /api/auth/register
 * Public: Register a new user (VIEWER by default)
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser({ name, email, password });
  return successResponse(res, result, "User registered successfully.", 201);
});

/**
 * POST /api/auth/login
 * Public: Authenticate and receive a JWT
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  return successResponse(res, result, "Login successful.");
});

module.exports = { register, login };
