import { Router } from "express";

import * as categoryController from "../controllers/category.controller.js";

const router = Router();

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

export default router;
