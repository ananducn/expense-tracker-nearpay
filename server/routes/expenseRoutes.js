import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  addExpense,
  getExpenses,
  deleteExpense,
  getExpensesRange,
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(protect);

router.get("/getExpenses", getExpenses);
router.post("/addExpense", addExpense);
router.delete("/deleteExpense/:id", deleteExpense);
router.get("/range", getExpensesRange);

export default router;
