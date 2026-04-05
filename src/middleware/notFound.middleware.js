/**
 * Catches all unmatched routes and returns a 404 JSON response.
 */
const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { notFound };
