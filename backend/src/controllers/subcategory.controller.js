import e from "express";
import * as subcategoryService from "../services/subcategory.service.js";

async function createSubcategory(req, res) {
  try {
    const subcategory = await subcategoryService.createSubcategory(req.body);

    return res.status(201).json({
      message: "Subcategoria creada correctamente",
      data: subcategory,
    });
  } catch (error) {
    console.error("Error al crear la subcategoria: ", error);

    return res.status(500).json({
      message: "Error al crear la subcategoria",
    });
  }
}

async function getAllSubcategories(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await subcategoryService.getSubcategories({
      page,
      limit,
      search,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener subcategorias", error);

    return res.status(500).json({
      message: "Error al obtener subcategorias",
    });
  }
}

async function updateSubactegory(req, res) {
  try {
    const id = Number(req.params.id);

    const subcategory = await subcategoryService.updateSubcategory(
      id,
      req.body,
    );

    if (!subcategory) {
      return res.status(404).json({
        message: "subcategoria no encontrada",
      });
    }

    return res.status(200).json({
      message: "Subcategoria actualizada correctamente",
      data: subcategory,
    });
  } catch (error) {
    console.error("Error al actualizar subactegoria", error);

    return res.status(500).json({
      message: "Error al actualizar la subcategoria",
    });
  }
}

async function deleteSubcategory(req, res) {
  try {
    const id = Number(req.params.id);

    const subcategory = await subcategoryService.deleteSubcategory(id);

    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategoria no encontrada",
      });
    }

    return res.status(200).json({
      message: "Subcategoria dada de baja correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar subcategoria: ", error);

    return res.status(500).json({
      message: " Error al eliminar la subcategoria",
    });
  }
}

export {
  createSubcategory,
  getAllSubcategories,
  updateSubactegory,
  deleteSubcategory,
};
