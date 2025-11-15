import Category from "../models/Category.js";

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
  await Category.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ message: "Deleted" });
};
