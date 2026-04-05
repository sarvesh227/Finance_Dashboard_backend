const AppError = require("../utils/AppError");

// Role hierarchy for comparison
const ROLE_HIERARCHY = { VIEWER: 0, ANALYST: 1, ADMIN: 2 };

/**
 * Returns middleware that allows access only to users with one of the specified roles.
 * Usage: authorize("ADMIN") or authorize("ANALYST", "ADMIN")
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Requires one of: [${allowedRoles.join(", ")}]. Your role: ${req.user.role}.`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Allows access to users whose role is at or above the minimum required level.
 * Usage: authorizeMinRole("ANALYST") → allows ANALYST and ADMIN
 */
const authorizeMinRole = (minRole) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 999;

    if (userLevel < requiredLevel) {
      return next(
        new AppError(
          `Access denied. Minimum required role: ${minRole}. Your role: ${req.user.role}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorize, authorizeMinRole };
