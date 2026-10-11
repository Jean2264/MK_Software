import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

// Middlewares para interpretar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/categorias", categoryRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/subcategorias", subcategoryRoutes);

export default app;
