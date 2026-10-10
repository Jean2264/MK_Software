import express from "express";

import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js";
const app = express();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(cors());

app.use("/api/categorias", categoryRoutes);

app.use("/api/productos", productRoutes);

app.use("/api/subcategorias", subcategoryRoutes);

export default app;
