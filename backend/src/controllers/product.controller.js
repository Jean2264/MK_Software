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

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);

    res.status(500).json({
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
      estado,
      sortBy,
      sortOrder,
    } = req.query;

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

    res.status(200).json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener los productos.",
    });
  }
}

export { createProduct, getProducts };
