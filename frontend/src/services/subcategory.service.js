const API_URL = "http://localhost:3000/api";

//crear subcategorias

async function createSubcategory(subcategory) {
  const response = await fetch(`${API_URL}/subcategorias`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(subcategory),
  });

  if (!response.ok) {
    throw new Error("Error al crear subcategoria front");
  }

  return await response.json();
}

async function getSubcategories(page = 1, limit = 5, search = "") {
  const params = new URLSearchParams({
    page,
    limit,
    search,
  });

  const response = await fetch(`
        ${API_URL}/subcategorias?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Error al obtener las subcategorias");
  }

  return await response.json();
}

async function updateSubcategory(id, subcategory) {
  const response = await fetch(
    `
        ${API_URL}/subcategorias/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subcategory),
    },
  );

  if (!response.ok) {
    throw new Error("Error al actualizar la subcategoria-front");
  }

  return await response.json();
}

async function deleteSubcategory(id) {
  const response = await fetch(
    `
        ${API_URL}/subcategorias/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Error al eliminar la subcategoria-front");
  }

  return await response.json();
}

export {
  createSubcategory,
  getSubcategories,
  updateSubcategory,
  deleteSubcategory,
};
