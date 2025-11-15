import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  amount: Number,
  date: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Expense", expenseSchema);
