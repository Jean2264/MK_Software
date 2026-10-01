import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/categorias", categoryRoutes);

app.use("/api/productos", productRoutes);

export default app;
