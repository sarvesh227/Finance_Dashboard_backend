const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/helpers");
const recordService = require("../services/record.service");

/**
 * GET /api/records
 * Analyst/Admin: All records with filters + pagination
 */
const getRecords = asyncHandler(async (req, res) => {
  const result = await recordService.getRecords(req.user.id, req.user.role, req.query);
  return successResponse(res, result);
});

/**
 * GET /api/records/:id
 * Returns a single record. Analyst/Admin only.
 */
const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id, req.user.id, req.user.role);
  return successResponse(res, { record });
});

/**
 * POST /api/records
 * Admin: Create a new financial record
 */
const createRecord = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(req.user.id, req.body);
  return successResponse(res, { record }, "Record created successfully.", 201);
});

/**
 * PUT /api/records/:id
 * Admin: Update a record.
 */
const updateRecord = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  );
  return successResponse(res, { record }, "Record updated.");
});

/**
 * DELETE /api/records/:id
 * Admin can delete.
 */
const deleteRecord = asyncHandler(async (req, res) => {
  await recordService.deleteRecord(req.params.id, req.user.id, req.user.role);
  return successResponse(res, null, "Record deleted successfully.");
});

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };
