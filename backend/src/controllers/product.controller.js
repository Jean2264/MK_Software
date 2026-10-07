import e from "express";
import * as productService from "../services/product.service.js";

async function createProduct(req, res) {
  try {
    const product = {
      ...req.body,

      precioMayorista:
        req.body.precioMayorista === "" ? null : req.body.precioMayorista,

      cantidadMinMayorista:
        req.body.cantidadMinMayorista === ""
          ? null
          : req.body.cantidadMinMayorista,

      imagen: req.file ? `/uploads/productos/${req.file.filename}` : null,
    };

    console.log("PRODUCT:", product);

    const newProduct = await productService.createProduct(product);

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al crear el producto.",
    });
  }
}

async function getProducts(req, res) {
  try {
    const {
      page,
      limit,
      search,
      idCategoria,
      idSubcategoria,

      sortBy,
      sortOrder,
    } = req.query;

    const estado =
      req.query.estado == undefined ? true : req.query.estado === "true";

    const products = await productService.getProducts({
      page,
      limit,
      search,
      idCategoria,
      idSubcategoria,
      estado,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al obtener los productos.",
    });
  }
}

async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "producto no encontrado",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al obtener producto",
    });
  }
}

async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);

    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      message: "producto actualzado",
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);

    const product = await productService.deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        message: "producto no encontrado",
      });
    }

    return res.status(200).json({
      message: "Producto eliminado",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
}

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
