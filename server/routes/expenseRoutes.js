import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  addExpense,
  getExpenses,
  deleteExpense
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(protect);

router.get("/", getExpenses);
router.post("/", addExpense);
router.delete("/:id", deleteExpense);

export default router;
