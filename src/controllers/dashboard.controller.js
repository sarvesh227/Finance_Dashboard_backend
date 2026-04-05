const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/helpers");
const dashboardService = require("../services/dashboard.service");

/**
 * GET /api/dashboard/summary
 * All roles: Returns income, expense, net balance, category breakdown, and recent records.
 * VIEWER sees own data only; ANALYST/ADMIN see all data.
 */
const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary(req.user.id, req.user.role, req.query.targetUserId);
  return successResponse(res, data);
});

/**
 * GET /api/dashboard/trends
 * Query param: months (default 12, max 24)
 * All roles: Monthly income vs expense trends.
 */
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 12));
  const trends = await dashboardService.getMonthlyTrends(req.user.id, req.user.role, months, req.query.targetUserId);
  return successResponse(res, { trends, months });
});

module.exports = { getSummary, getMonthlyTrends };
