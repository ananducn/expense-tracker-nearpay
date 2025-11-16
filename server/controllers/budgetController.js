import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";
export const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month)
      return res
        .status(400)
        .json({ message: "month query param required (YYYY-MM)" });

    const userIdStr =
      req.user && req.user._id ? String(req.user._id) : String(req.user);
    if (!userIdStr) return res.status(401).json({ message: "Not authorized" });
    const userId = new mongoose.Types.ObjectId(userIdStr);

    // compute month start and end (UTC)
    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const pipeline = [
      { $match: { user: userId, month } }, // budgets for this user+month
      // populate category
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      // lookup expenses by date range and same category
      {
        $lookup: {
          from: "expenses",
          let: { catId: "$category._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", userId] },
                    { $eq: ["$category", "$$catId"] },
                    { $gte: ["$date", monthStart] },
                    { $lt: ["$date", monthEnd] },
                  ],
                },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          as: "expenseAgg",
        },
      },

      // set totalSpent
      {
        $addFields: {
          totalSpent: {
            $ifNull: [{ $arrayElemAt: ["$expenseAgg.total", 0] }, 0],
          },
        },
      },

      { $project: { expenseAgg: 0 } },
    ];

    const budgets = await Budget.aggregate(pipeline);
    return res.json(budgets);
  } catch (err) {
    console.error("getBudgets error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch budgets", error: err.message });
  }
};

export const upsertBudget = async (req, res) => {
  const { categoryId, month, limit } = req.body;

  let budget = await Budget.findOne({
    user: req.user,
    category: categoryId,
    month,
  });

  if (budget) {
    budget.limit = limit;
    await budget.save();
  } else {
    budget = await Budget.create({
      user: req.user,
      category: categoryId,
      month,
      limit,
    });
  }

  res.json(budget);
};

export const deleteBudget = async (req, res) => {
  await Budget.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ message: "Deleted" });
};
