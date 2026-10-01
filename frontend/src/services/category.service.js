const API_URL = "http://localhost:3000/api";

//crear categoria
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

//obtener categorias

export { createCategory };
