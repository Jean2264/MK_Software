import * as productRepository from "../repositories/product.repository.js";

async function createProduct(product) {
  const newProduct = await productRepository.createProduct(product);

  return newProduct;
}

async function getProducts(filters) {
  const products = await productRepository.getProducts(filters);

  return products;
}

export { createProduct, getProducts };
