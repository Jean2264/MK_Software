import * as categoryRepository from "../repositories/Category.repository.js";

async function createCategory(category) {
  const newCategory = await categoryRepository.createCategory(category);

  return newCategory;
}

async function getCategories(filters) {
  const categories = await categoryRepository.getCategories(filters);

  return categories;
}

export { createCategory, getCategories };
