import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.use(protect);

router.get("/getCategories", getCategories);
router.post("/createCategories", createCategory);
router.put("/updateCategories/:id", updateCategory);
router.delete("/deleteCategories/:id", deleteCategory);

export default router;
