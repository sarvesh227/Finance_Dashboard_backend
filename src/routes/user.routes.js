const { Router } = require("express");
const { body, param } = require("express-validator");
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Validation Chains ────────────────────────────────────────────────────────

const createUserValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain at least one number."),

  body("role")
    .optional()
    .isIn(["VIEWER", "ANALYST", "ADMIN"]).withMessage("Role must be VIEWER, ANALYST, or ADMIN."),
];

const roleValidation = [
  param("id").isInt({ gt: 0 }).withMessage("User ID must be a positive integer."),
  body("role")
    .notEmpty().withMessage("Role is required.")
    .isIn(["VIEWER", "ANALYST", "ADMIN"]).withMessage("Role must be VIEWER, ANALYST, or ADMIN."),
];

const statusValidation = [
  param("id").isInt({ gt: 0 }).withMessage("User ID must be a positive integer."),
  body("isActive")
    .notEmpty().withMessage("isActive field is required.")
    .isBoolean().withMessage("isActive must be a boolean."),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/users/me
 * All authenticated users – Get own profile
 */
router.get("/me", userController.getMyProfile);

/**
 * GET /api/users
 * Admin only – List all users
 */
router.get("/", authorize("ANALYST", "ADMIN"), userController.getAllUsers);

/**
 * GET /api/users/:id
 * Admin only – Get a specific user
 */
router.get(
  "/:id",
  authorize("ADMIN"),
  [param("id").isInt({ gt: 0 }).withMessage("User ID must be a positive integer.")],
  validate,
  userController.getUserById
);

/**
 * POST /api/users
 * Admin only – Create a user with any role
 */
router.post("/", authorize("ADMIN"), createUserValidation, validate, userController.createUser);

/**
 * PATCH /api/users/:id/role
 * Admin only – Change a user's role
 */
router.patch(
  "/:id/role",
  authorize("ADMIN"),
  roleValidation,
  validate,
  userController.updateUserRole
);

/**
 * PATCH /api/users/:id/status
 * Admin only – Activate or deactivate a user
 */
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  statusValidation,
  validate,
  userController.setUserActiveStatus
);

module.exports = router;
