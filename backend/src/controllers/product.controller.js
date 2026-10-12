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

      idSubcategoria:
        req.body.idSubcategoria === "" ? null : req.body.idSubcategoria,

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

async function searchProducts(req, res) {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;

    if (
      !/^\d+$/.test(page) ||
      !/^\d+$/.test(limit) ||
      Number(page) < 1 ||
      Number(limit) < 1
    ) {
      return res.status(400).json({
        message: "Los parámetros page y limit deben ser enteros positivos.",
      });
    }

    const products = await productService.searchProducts({
      page,
      limit,
      search,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al obtener productos.",
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
async function getProductByBarcode(req, res) {
  try {
    const barcode = req.params.barcode;

    const product = await productService.getProductByBarcode(barcode);

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
}
async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);

    const product = {
      ...req.body,

      precioMayorista:
        req.body.precioMayorista === "" ? null : req.body.precioMayorista,

      cantidadMinMayorista:
        req.body.cantidadMinMayorista === ""
          ? null
          : req.body.cantidadMinMayorista,

      idSubcategoria:
        req.body.idSubcategoria === "" ? null : req.body.idSubcategoria,

      // Solo actualizar la imagen si se subió una nueva.
      imagen: req.file ? `/uploads/productos/${req.file.filename}` : undefined,
    };

    // Si no se subió una imagen, conservar la existente.
    if (product.imagen === undefined) {
      delete product.imagen;
    }

    const updatedProduct = await productService.updateProduct(id, product);

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      message: "Producto actualizado",
      data: updatedProduct,
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
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByBarcode,
};
