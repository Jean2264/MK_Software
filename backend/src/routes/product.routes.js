import { Router } from "express";

import * as productoController from "../controllers/product.controller.js";
import uploadProduct from "../middleware/uploadProduct.js";

const router = Router();

router.post(
  "/",
  uploadProduct.single("imagen"),
  productoController.createProduct,
);

router.get("/", productoController.getProducts);
router.get("/:id", productoController.getProductById);

router.put("/:id", productoController.updateProduct);
router.delete("/:id", productoController.deleteProduct);

export default router;
