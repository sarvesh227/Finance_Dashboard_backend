const prisma = require("../lib/prisma");

/**
 * Computes dashboard summary statistics using aggregated Prisma queries.
 * All roles see the global aggregated data.
 */
const getDashboardSummary = async (userId, userRole, targetUserId) => {
  const scopeFilter = {};

  // Run all aggregate queries in parallel for performance
  const [incomeAgg, expenseAgg, categoryTotals, recentRecords] = await Promise.all([
    // Total income
    prisma.record.aggregate({
      where: { ...scopeFilter, type: "INCOME" },
      _sum: { amount: true },
      _count: true,
    }),

    // Total expense
    prisma.record.aggregate({
      where: { ...scopeFilter, type: "EXPENSE" },
      _sum: { amount: true },
      _count: true,
    }),

    // Category-wise totals (both income and expense)
    prisma.record.groupBy({
      by: ["category", "type"],
      where: scopeFilter,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
    }),

    // Recent 5 records
    prisma.record.findMany({
      where: scopeFilter,
      take: 5,
      orderBy: { date: "desc" },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;
  const netBalance = totalIncome - totalExpense;

  return {
    summary: {
      totalIncome,
      totalExpense,
      netBalance,
      incomeCount: incomeAgg._count,
      expenseCount: expenseAgg._count,
    },
    categoryBreakdown: categoryTotals.map((item) => ({
      category: item.category,
      type: item.type,
      total: item._sum.amount || 0,
      count: item._count,
    })),
    recentRecords,
  };
};

/**
 * Returns monthly income/expense trends for the past N months.
 * Groups records by year-month and sums amounts by type.
 */
const getMonthlyTrends = async (userId, userRole, months = 12, targetUserId) => {
  const scopeFilter = {};

  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - months + 1);
  fromDate.setDate(1);
  fromDate.setHours(0, 0, 0, 0);

  const records = await prisma.record.findMany({
    where: {
      ...scopeFilter,
      date: { gte: fromDate },
    },
    select: { amount: true, type: true, date: true },
    orderBy: { date: "asc" },
  });

  // Group by year-month
  const monthMap = {};
  for (const record of records) {
    const year = record.date.getFullYear();
    const month = String(record.date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    if (!monthMap[key]) {
      monthMap[key] = { month: key, income: 0, expense: 0, net: 0 };
    }

    if (record.type === "INCOME") {
      monthMap[key].income += record.amount;
    } else {
      monthMap[key].expense += record.amount;
    }
    monthMap[key].net = monthMap[key].income - monthMap[key].expense;
  }

  return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
};

module.exports = { getDashboardSummary, getMonthlyTrends };
