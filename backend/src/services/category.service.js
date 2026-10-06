import * as categoryRepository from "../repositories/Category.repository.js";

async function createCategory(category) {
  const newCategory = await categoryRepository.createCategory(category);

  return newCategory;
}

async function getCategories(filters) {
  const categories = await categoryRepository.getAllCategories(filters);

  return categories;
}

async function updateCategory(id, category) {
  return await categoryRepository.updateCategory(id, category);
}

async function deleteCategory(id) {
  return await categoryRepository.deleteCategory(id);
}

export { createCategory, getCategories, updateCategory, deleteCategory };
