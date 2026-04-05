const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { parsePagination } = require("../utils/helpers");

/**
 * Builds a Prisma where-clause from query filters.
 */
const buildFilters = ({ type, category, dateFrom, dateTo }) => {
  const where = {};

  if (type) {
    where.type = type.toUpperCase();
  }

  if (category) {
    where.category = { contains: category, mode: "insensitive" };
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  return where;
};

/**
 * Returns a paginated list of records with optional filters.
 * ADMIN/ANALYST see all records; VIEWER only sees their own.
 */
const getRecords = async (userId, userRole, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);

  // Default isolation
  filters.userId = userId;

  if (userRole === "ANALYST" || userRole === "ADMIN") {
    if (!query.targetUserId || query.targetUserId === 'all') {
      delete filters.userId; // Global view
    } else {
      filters.userId = Number(query.targetUserId);
    }
  }

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.record.count({ where: filters }),
  ]);

  return {
    records,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Fetches a single record by ID.
 * VIEWER can only access their own records.
 */
const getRecordById = async (id, userId, userRole) => {
  const record = await prisma.record.findUnique({
    where: { id: Number(id) },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!record) throw new AppError("Record not found.", 404);

  if (userRole !== "ADMIN" && userRole !== "ANALYST" && record.userId !== userId) {
    throw new AppError("Access denied. You can only view your own records.", 403);
  }

  return record;
};

/**
 * Creates a new financial record for the authenticated user.
 */
const createRecord = async (userId, { amount, type, category, date, notes }) => {
  return prisma.record.create({
    data: {
      amount: parseFloat(amount),
      type: type.toUpperCase(),
      category,
      date: new Date(date),
      notes: notes || null,
      userId,
    },
  });
};

/**
 * Updates an existing record. Users can only update their own records unless ADMIN.
 */
const updateRecord = async (id, userId, userRole, data) => {
  const record = await prisma.record.findUnique({ where: { id: Number(id) } });

  if (!record) throw new AppError("Record not found.", 404);

  if (userRole !== "ADMIN" && record.userId !== userId) {
    throw new AppError("Access denied. You can only update your own records.", 403);
  }

  const updateData = {};
  if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
  if (data.type !== undefined) updateData.type = data.type.toUpperCase();
  if (data.category !== undefined) updateData.category = data.category;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.notes !== undefined) updateData.notes = data.notes;

  return prisma.record.update({
    where: { id: Number(id) },
    data: updateData,
  });
};

/**
 * Deletes a record. Only ADMIN or record owner can delete.
 */
const deleteRecord = async (id, userId, userRole) => {
  const record = await prisma.record.findUnique({ where: { id: Number(id) } });

  if (!record) throw new AppError("Record not found.", 404);

  if (userRole !== "ADMIN" && record.userId !== userId) {
    throw new AppError("Access denied. You can only delete your own records.", 403);
  }

  await prisma.record.delete({ where: { id: Number(id) } });
  return { deleted: true };
};

module.exports = {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};
