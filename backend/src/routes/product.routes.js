import { Router } from "express";

import {
  createProduct,
  getProducts,
} from "../controllers/product.controller.js";

import uploadProduct from "../middleware/uploadProduct.js";

const router = Router();

router.post("/", uploadProduct.single("imagen"), createProduct);

router.get("/", getProducts);

export default router;
