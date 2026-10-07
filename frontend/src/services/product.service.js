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

async function getProducts(page = 1) {
  const response = await fetch(`${API_URL}/productos?page=${page}&limit=10`);

  if (!response.ok) {
    throw new Error("Error al obtener los productos");
  }

  return await response.json();
}

async function getProductById(id) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el  producto");
  }
  return await response.json();
}

async function updateProduct(id, product) {
  const response = await fetch(
    `
    ${API_URL}/productos/${id}
    `,
    {
      method: "PUT",
      body: product,
    },
  );

  if (!response.ok) {
    throw new Error("Error al actualizar product-front");
  }

  return await response.json();
}

async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al intentar eliminar producto");
  }

  return await response.json();
}

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
