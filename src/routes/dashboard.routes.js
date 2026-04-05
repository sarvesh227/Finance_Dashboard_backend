const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = Router();

// All dashboard routes require authentication (any role can view their data)
router.use(authenticate);

/**
 * GET /api/dashboard/summary
 * All roles – Overview: totals, category breakdown, recent 5 records
 * VIEWER: own data | ANALYST/ADMIN: all data
 */
router.get("/summary", dashboardController.getSummary);

/**
 * GET /api/dashboard/trends
 * All roles – Monthly income vs expense for the past N months
 * Query: ?months=12 (default) | max 24
 */
router.get("/trends", dashboardController.getMonthlyTrends);

module.exports = router;
