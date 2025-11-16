// controllers/expenseController.js
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import getMonthString from "../utils/getMonthString.js";

const isValidId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(String(id));
  } catch {
    return false;
  }
};

export const addExpense = async (req, res) => {
  try {
    // --- normalize/validate user id ---
    const rawUser = req.user;
    if (!rawUser) {
      return res
        .status(401)
        .json({ message: "Unauthorized: missing user (req.user)" });
    }
    const userIdStr = rawUser._id ? String(rawUser._id) : String(rawUser);
    if (!isValidId(userIdStr)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const userId = new mongoose.Types.ObjectId(userIdStr);

    // --- accept category or categoryId ---
    const rawCategory = req.body.category ?? req.body.categoryId;
    const { amount: amountRaw, date: dateRaw, notes } = req.body;

    if (!rawCategory) {
      return res
        .status(400)
        .json({ message: "category (or categoryId) is required" });
    }
    if (!isValidId(rawCategory)) {
      return res
        .status(400)
        .json({ message: "category must be a valid ObjectId" });
    }
    const categoryId = new mongoose.Types.ObjectId(String(rawCategory));

    // --- validate amount ---
    const amount = Number(amountRaw);
    if (Number.isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount must be a positive number" });
    }

    // --- parse date and month ---
    const d = dateRaw ? new Date(dateRaw) : new Date();
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ message: "invalid date" });
    }
    const month = getMonthString(d); // "YYYY-MM"

    // --- create expense (also store month if model has field) ---
    const expense = await Expense.create({
      user: userId,
      category: categoryId,
      amount,
      date: d,
      month, // store month (helps queries/aggregations) — optional if model has field
      notes,
    });

    // --- compute month range: start inclusive, end exclusive ---
    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    // --- find budget ---
    const budget = await Budget.findOne({
      user: userId,
      category: categoryId,
      month,
    });

    let budgetSummary = { limit: 0, spent: 0, remaining: 0 };
    let status = "WITHIN_BUDGET";

    if (budget) {
      const expensesThisMonth = await Expense.aggregate([
        {
          $match: {
            user: userId,
            category: categoryId,
            date: { $gte: monthStart, $lt: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = expensesThisMonth.length ? expensesThisMonth[0].total : 0;
      const remaining = budget.limit - spent;

      budgetSummary = { limit: budget.limit, spent, remaining };
      if (remaining < 0) status = "OVER_BUDGET";
    }

    // --- return populated expense ---
    const expensePop = await Expense.findById(expense._id).populate("category");

    return res
      .status(201)
      .json({ expense: expensePop, budget: budgetSummary, status });
  } catch (err) {
    console.error("addExpense error (full):", err);
    return res.status(500).json({
      message: "Failed to add expense (server error)",
      error: err?.message ?? String(err),
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month)
      return res
        .status(400)
        .json({ message: "month query param required (YYYY-MM)" });

    // normalize user id again
    const rawUser = req.user;
    if (!rawUser) return res.status(401).json({ message: "Unauthorized" });
    const userIdStr = rawUser._id ? String(rawUser._id) : String(rawUser);
    if (!isValidId(userIdStr))
      return res.status(400).json({ message: "Invalid user id" });
    const userId = new mongoose.Types.ObjectId(userIdStr);

    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: monthStart, $lt: monthEnd },
    })
      .populate("category")
      .sort({ date: -1 });

    return res.json(expenses);
  } catch (err) {
    console.error("getExpenses error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch expenses", error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const rawUser = req.user;
    if (!rawUser) return res.status(401).json({ message: "Unauthorized" });
    const userIdStr = rawUser._id ? String(rawUser._id) : String(rawUser);
    if (!isValidId(userIdStr))
      return res.status(400).json({ message: "Invalid user id" });
    const userId = new mongoose.Types.ObjectId(userIdStr);

    const result = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });
    if (!result) return res.status(404).json({ message: "Expense not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteExpense error:", err);
    return res
      .status(500)
      .json({ message: "Delete failed", error: err.message });
  }
};

export const getExpensesRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end)
      return res
        .status(400)
        .json({ message: "start and end query params required (YYYY-MM-DD)" });

    // parse dates (treat start at 00:00:00.000 and end at 23:59:59.999 UTC)
    const startDate = new Date(`${start}T00:00:00.000Z`);
    const endDate = new Date(`${end}T23:59:59.999Z`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD." });
    if (startDate > endDate)
      return res.status(400).json({ message: "start must be <= end" });

    // normalize user id from req.user
    const rawUser = req.user;
    if (!rawUser) return res.status(401).json({ message: "Unauthorized" });
    const userIdStr = rawUser._id ? String(rawUser._id) : String(rawUser);
    if (!mongoose.Types.ObjectId.isValid(userIdStr))
      return res.status(400).json({ message: "Invalid user id" });

    const userId = new mongoose.Types.ObjectId(userIdStr);

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("category")
      .sort({ date: -1 });

    return res.json(expenses);
  } catch (err) {
    console.error("getExpensesRange error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch expenses", error: err.message });
  }
};
