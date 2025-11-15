import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import getMonthString from "../utils/getMonthString.js";

export const addExpense = async (req, res) => {
  const { category, amount, date, notes } = req.body;

  const d = new Date(date);
  const month = getMonthString(d);

  const expense = await Expense.create({
    user: req.user,
    category,
    amount,
    date: d,
    notes,
  });

  const budget = await Budget.findOne({
    user: req.user,
    category,
    month,
  });

  let budgetSummary = { limit: 0, spent: 0, remaining: 0 };
  let status = "WITHIN_BUDGET";

  if (budget) {
    const expensesThisMonth = await Expense.aggregate([
      {
        $match: {
          user: expense.user,
          category: expense.category,
          date: {
            $gte: new Date(`${month}-01`),
            $lt: new Date(`${month}-31`)
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const spent = expensesThisMonth.length ? expensesThisMonth[0].total : 0;

    const remaining = budget.limit - spent;

    budgetSummary = {
      limit: budget.limit,
      spent,
      remaining,
    };

    if (remaining < 0) status = "OVER_BUDGET";
  }

  res.json({ expense, budget: budgetSummary, status });
};

export const getExpenses = async (req, res) => {
  const { month } = req.query;

  const expenses = await Expense.find({
    user: req.user,
    date: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31`)
    }
  })
    .populate("category")
    .sort({ date: -1 });

  res.json(expenses);
};

export const deleteExpense = async (req, res) => {
  await Expense.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ message: "Deleted" });
};
