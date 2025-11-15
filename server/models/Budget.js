import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  month: { type: String, required: true }, // YYYY-MM
  limit: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Budget", budgetSchema);
