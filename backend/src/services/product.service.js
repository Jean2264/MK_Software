import * as productRepository from "../repositories/product.repository.js";

async function createProduct(product) {
  const newProduct = await productRepository.createProduct(product);

  return newProduct;
}

async function getProducts(filters) {
  const products = await productRepository.getProducts(filters);

  return products;
}

async function getProductById(id) {
  return await productRepository.getProductById(id);
}

async function updateProduct(id, product) {
  return await productRepository.updateProduct(id, product);
}

async function deleteProduct(id) {
  return await productRepository.deleteProduct(id);
}

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
