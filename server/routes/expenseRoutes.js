import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  addExpense,
  getExpenses,
  deleteExpense,
  getExpensesRange,
  updateExpense
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(protect);

router.get("/getExpenses", getExpenses);
router.post("/addExpense", addExpense);
router.delete("/deleteExpense/:id", deleteExpense);
router.get("/range", getExpensesRange);
router.put("/updateExpense/:id", updateExpense); 

export default router;
