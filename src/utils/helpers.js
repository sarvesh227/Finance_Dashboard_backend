/**
 * Strips the password field from a user object before sending to client.
 */
const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

/**
 * Builds consistent success response shape.
 */
const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Parses pagination query params with defaults.
 * Returns { page, limit, skip }.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { sanitizeUser, successResponse, parsePagination };
