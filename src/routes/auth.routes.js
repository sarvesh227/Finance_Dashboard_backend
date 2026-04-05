const { Router } = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");

const router = Router();

// ─── Validation Chains ────────────────────────────────────────────────────────

const registerValidation = [
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
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Public – Self-registration (always VIEWER role)
 */
router.post("/register", registerValidation, validate, authController.register);

/**
 * POST /api/auth/login
 * Public – Returns JWT token
 */
router.post("/login", loginValidation, validate, authController.login);

module.exports = router;
