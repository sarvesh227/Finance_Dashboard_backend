const { Router } = require("express");
const { body, param, query } = require("express-validator");
const recordController = require("../controllers/record.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeMinRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = Router();

// All record routes require authentication
router.use(authenticate);

// ─── Validation Chains ────────────────────────────────────────────────────────

const createValidation = [
  body("amount")
    .notEmpty().withMessage("Amount is required.")
    .isFloat({ gt: 0 }).withMessage("Amount must be a number greater than 0."),

  body("type")
    .notEmpty().withMessage("Type is required.")
    .isIn(["INCOME", "EXPENSE", "income", "expense"])
    .withMessage("Type must be INCOME or EXPENSE."),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required.")
    .isLength({ min: 1, max: 100 }).withMessage("Category must be 1–100 characters."),

  body("date")
    .notEmpty().withMessage("Date is required.")
    .isISO8601().withMessage("Date must be a valid ISO 8601 date (e.g. 2024-01-15)."),

  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes must be at most 500 characters."),
];

const updateValidation = [
  param("id").isInt({ gt: 0 }).withMessage("Record ID must be a positive integer."),

  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a number greater than 0."),

  body("type")
    .optional()
    .isIn(["INCOME", "EXPENSE", "income", "expense"])
    .withMessage("Type must be INCOME or EXPENSE."),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("Category must be 1–100 characters."),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date."),

  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes must be at most 500 characters."),
];

const filterValidation = [
  query("type")
    .optional()
    .isIn(["INCOME", "EXPENSE", "income", "expense"])
    .withMessage("Filter type must be INCOME or EXPENSE."),

  query("dateFrom")
    .optional()
    .isISO8601().withMessage("dateFrom must be a valid ISO 8601 date."),

  query("dateTo")
    .optional()
    .isISO8601().withMessage("dateTo must be a valid ISO 8601 date."),

  query("page")
    .optional()
    .isInt({ gt: 0 }).withMessage("Page must be a positive integer."),

  query("limit")
    .optional()
    .isInt({ gt: 0, max: 100 }).withMessage("Limit must be between 1 and 100."),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/records
 * Analyst/Admin: All records
 * Supports: ?type=INCOME&category=food&dateFrom=2024-01-01&dateTo=2024-12-31&page=1&limit=10
 */
router.get("/", authorizeMinRole("ANALYST"), filterValidation, validate, recordController.getRecords);

/**
 * GET /api/records/:id
 * Analyst/Admin only
 */
router.get(
  "/:id",
  authorizeMinRole("ANALYST"),
  [param("id").isInt({ gt: 0 }).withMessage("Record ID must be a positive integer.")],
  validate,
  recordController.getRecordById
);

/**
 * POST /api/records
 * Admin only — Create a record
 */
router.post(
  "/",
  authorizeMinRole("ADMIN"),
  createValidation,
  validate,
  recordController.createRecord
);

/**
 * PUT /api/records/:id
 * Admin only — Full update
 */
router.put(
  "/:id",
  authorizeMinRole("ADMIN"),
  updateValidation,
  validate,
  recordController.updateRecord
);

/**
 * PATCH /api/records/:id
 * Admin only — Partial update
 */
router.patch(
  "/:id",
  authorizeMinRole("ADMIN"),
  updateValidation,
  validate,
  recordController.updateRecord
);

/**
 * DELETE /api/records/:id
 * Admin only — Delete a record
 */
router.delete(
  "/:id",
  authorizeMinRole("ADMIN"),
  [param("id").isInt({ gt: 0 }).withMessage("Record ID must be a positive integer.")],
  validate,
  recordController.deleteRecord
);

module.exports = router;
