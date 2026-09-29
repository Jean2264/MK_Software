const API_URL = "http://localhost:3000/api";

async function createProduct(product) {
  const response = await fetch(`${API_URL}/productos`, {
    method: "POST",
    body: product,
  });

  if (!response.ok) {
    throw new Error("Error al crear el producto");
  }

  return await response.json();
}

async function getProducts() {
  const response = await fetch(`${API_URL}/productos`);

  if (!response.ok) {
    throw new Error("Error al obtener los productos");
  }

  return await response.json();
}

export { createProduct, getProducts };
