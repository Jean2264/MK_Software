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

async function getProducts(page = 1, search = "") {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    search,
  });

  const response = await fetch(`${API_URL}/productos?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Error al obtener los productos");
  }

  return await response.json();
}

async function searchProducts(search, page = 1, limit = 10) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${API_URL}/products/search?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Error al buscar productos");
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

async function getProductByBarcode(barcode) {
  const response = await fetch(
    `${API_URL}/productos/barcode/${encodeURIComponent(barcode)}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error("Error al buscar el producto");
  }

  return await response.json();
}

async function updateProduct(id, product) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    body: product,
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el producto");
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
  searchProducts,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deleteProduct,
};
