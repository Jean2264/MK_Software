import { Router } from "express";

import * as subcategoryController from "../controllers/subcategory.controller.js";

const route = Router();

route.post("/", subcategoryController.createSubcategory);
route.get("/", subcategoryController.getAllSubcategories);

route.put("/:id", subcategoryController.updateSubactegory);
route.delete("/:id", subcategoryController.deleteSubcategory);

export default route;
