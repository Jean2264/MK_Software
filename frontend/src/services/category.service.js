const API_URL = "http://localhost:3000/api";

// Crear categoría
async function createCategory(category) {
  const response = await fetch(`${API_URL}/categorias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    throw new Error("Error al crear la categoría");
  }

  return await response.json();
}

// Obtener categorías
async function getCategories(page = 1, limit = 5, search = "") {
  const params = new URLSearchParams({
    page,
    limit,
    search,
  });

  const response = await fetch(`${API_URL}/categorias?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Error al obtener las categorías");
  }

  return await response.json();
}

async function updateCategory(id, category) {
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    throw new Error("Error al actualizar la categoria-front");
  }

  return await response.json();
}

async function deleteCategory(id) {
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error al dar de baja la categorias-front");
  }

  return await response.json();
}

export { createCategory, getCategories, updateCategory, deleteCategory };
