import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  getBudgets,
  upsertBudget,
  deleteBudget
} from "../controllers/budgetController.js";

const router = express.Router();

router.use(protect);

router.get("/", getBudgets);
router.post("/", upsertBudget);
router.delete("/:id", deleteBudget);

export default router;
