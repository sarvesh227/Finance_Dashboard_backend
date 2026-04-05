const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const prisma = require("../lib/prisma");

/**
 * Verifies JWT from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required. Please provide a valid token.", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new AppError("Token has expired. Please log in again.", 401);
      }
      throw new AppError("Invalid token. Please log in again.", 401);
    }

    // Fetch fresh user to check isActive status
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new AppError("User associated with this token no longer exists.", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated. Contact an administrator.", 403);
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
