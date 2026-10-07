import * as subcategoryRepository from "../repositories/subcategory.repository.js";

async function createSubcategory(subcategory) {
  const newSubcategory =
    await subcategoryRepository.createSubcategory(subcategory);

  return newSubcategory;
}

async function getSubcategories(filters) {
  const subcategories =
    await subcategoryRepository.getAllSubcategories(filters);

  return subcategories;
}

async function updateSubcategory(id, subcategory) {
  return await subcategoryRepository.updateSubcategory(id, subcategory);
}

async function deleteSubcategory(id) {
  return await subcategoryRepository.deleteSubcategory(id);
}

export {
  createSubcategory,
  getSubcategories,
  updateSubcategory,
  deleteSubcategory,
};
