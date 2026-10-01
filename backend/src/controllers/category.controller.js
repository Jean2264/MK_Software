import * as categoryService from "../services/category.service.js";

/*
 * ==========================================
 * CREAR CATEGORÍA
 * POST /api/categorias
 * ==========================================
 */

async function createCategory(req, res) {
  try {
    const category = await categoryService.createCategory(req.body);

    return res.status(201).json({
      message: "Categoría creada correctamente",
      data: category,
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);

    return res.status(500).json({
      message: "Error al crear la categoría",
    });
  }
}

/*
 * ==========================================
 * OBTENER CATEGORÍAS
 * GET /api/categorias
 * ==========================================
 */

async function getAllCategories(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await categoryService.getAllCategories({
      page,
      limit,
      search,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener categorías:", error);

    return res.status(500).json({
      message: "Error al obtener las categorías",
    });
  }
}

/*
 * ==========================================
 * OBTENER UNA CATEGORÍA
 * GET /api/categorias/:id
 * ==========================================
 */

async function getCategoryById(req, res) {
  try {
    const id = Number(req.params.id);

    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    return res.status(200).json({
      data: category,
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);

    return res.status(500).json({
      message: "Error al obtener la categoría",
    });
  }
}

/*
 * ==========================================
 * ACTUALIZAR CATEGORÍA
 * PUT /api/categorias/:id
 * ==========================================
 */

async function updateCategory(req, res) {
  try {
    const id = Number(req.params.id);

    const category = await categoryService.updateCategory(id, req.body);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    return res.status(200).json({
      message: "Categoría actualizada correctamente",
      data: category,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);

    return res.status(500).json({
      message: "Error al actualizar la categoría",
    });
  }
}

/*
 * ==========================================
 * ELIMINAR CATEGORÍA
 * DELETE /api/categorias/:id
 * ==========================================
 */

async function deleteCategory(req, res) {
  try {
    const id = Number(req.params.id);

    const category = await categoryService.deleteCategory(id);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    return res.status(200).json({
      message: "Categoría eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);

    return res.status(500).json({
      message: "Error al eliminar la categoría",
    });
  }
}

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
