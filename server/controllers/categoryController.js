import Category from "../models/Category.js";
import mongoose from "mongoose";
import { upsertBudget } from "./budgetController.js";
import Budget from "../models/Budget.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find({ user: req.user }).sort({
    createdAt: -1,
  });
  res.json(categories);
};

export const createCategory = async (req, res) => {
  const { name, color } = req.body;

  const category = await Category.create({ name, color, user: req.user });
  res.status(201).json(category);
};

export const updateCategory = async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    req.body,
    { new: true }
  );

  res.json(category);
};

export const deleteCategory = async (req, res) => {
  try {
    // remove the category (only if it belongs to this user)
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    // delete budgets associated with that category for this user
    const result = await Budget.deleteMany({
      category: deleted._id,
      user: req.user,
    });

    return res.json({
      message: "Deleted",
      deletedCategoryId: deleted._id,
      deletedBudgetsCount: result.deletedCount ?? 0,
    });
  } catch (err) {
    console.error("deleteCategory error:", err);
    return res
      .status(500)
      .json({ message: "Delete failed", error: err.message });
  }
};
