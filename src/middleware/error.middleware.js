/**
 * Central error handler. Must be registered LAST in Express middleware chain.
 * Handles both operational AppErrors and unexpected programming errors.
 */
const errorHandler = (err, req, res, _next) => {
  // Default to 500
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error.";

  // Handle Prisma-specific errors
  if (err.code === "P2002") {
    statusCode = 409;
    const field = err.meta?.target?.[0] || "field";
    message = `A record with this ${field} already exists.`;
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found.";
  } else if (err.code === "P2003") {
    statusCode = 400;
    message = "Foreign key constraint failed.";
  }

  const response = {
    success: false,
    message,
  };

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} - ${message}`, err.code ? `(${err.code})` : "");

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
