import Budget from "../models/Budget.js";

export const getBudgets = async (req, res) => {
  const { month } = req.query;

  const budgets = await Budget.find({ user: req.user, month }).populate("category");
  res.json(budgets);
};

export const upsertBudget = async (req, res) => {
  const { categoryId, month, limit } = req.body;

  let budget = await Budget.findOne({ user: req.user, category: categoryId, month });

  if (budget) {
    budget.limit = limit;
    await budget.save();
  } else {
    budget = await Budget.create({
      user: req.user,
      category: categoryId,
      month,
      limit
    });
  }

  res.json(budget);
};

export const deleteBudget = async (req, res) => {
  await Budget.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ message: "Deleted" });
};
