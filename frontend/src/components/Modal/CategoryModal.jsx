import { useState, useEffect } from "react";

import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import Pagination from "../Pagination";
import CategoryFormModal from "./CategoryFormModal";

import * as categoryService from "../../services/category.service.js";
import * as subcategoryService from "../../services/subcategory.service.js";

import "./CategoryModal.css";
import ConfirmModal from "./ConfirmModal.jsx";

function CategoryModal({ isOpen, onClose }) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [activeTab, setActiveTab] = useState("categories");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");

  const [categoryPage, setCategoryPage] = useState(1);

  const [subcategoryPage, setSubcategoryPage] = useState(1);

  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [subcategoryTotalPages, setSubcategoryTotalPages] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [formMode, setFormMode] = useState("create");
  const [formType, setFormType] = useState("category");
  const [selectedItem, setSelectedItem] = useState(null);

  /*
   * ==============================
   * CARGAR CATEGORÍAS
   * ==============================
   */

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories(
        categoryPage,
        8,
        categorySearch,
      );

      setCategories(response.data);
      setCategoryTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error al cargar las categorias:", error);
    }
  };

  /*
   * ==============================
   * CARGAR SUBCATEGORÍAS
   * ==============================
   */

  const loadSubcategories = async () => {
    try {
      const response = await subcategoryService.getSubcategories(
        subcategoryPage,
        20,
        subcategorySearch,
      );

      setSubcategories(response.data);
      setSubcategoryTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error al cargar las subcategorias:", error);
    }
  };

  /*
   * ==============================
   * EFECTO
   * ==============================
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadCategories();
    loadSubcategories();
  }, [isOpen, categoryPage, subcategoryPage]);

  /*
   * ==============================
   * RESET AL CERRAR
   * ==============================
   */

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setCategorySearch("");
    setSubcategorySearch("");

    setCategoryPage(1);
    setSubcategoryPage(1);

    setCategoryTotalPages(1);
    setSubcategoryTotalPages(1);

    setActiveTab("categories");

    setIsFormModalOpen(false);
    setFormMode("create");
    setFormType("category");
    setSelectedItem(null);

    setIsConfirmModalOpen(false);
    setSelectedCategory(null);
  }, [isOpen]);

  /*
   * ==============================
   * CERRAR MODAL
   * ==============================
   */

  const handleCloseModal = () => {
    onClose();
  };

  /*
   * ==============================
   * ABRIR FORMULARIO
   * ==============================
   */

  const handleOpenCreateCategory = () => {
    setFormMode("create");
    setFormType("category");
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenCreateSubcategory = () => {
    setFormMode("create");
    setFormType("subcategory");
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditCategory = (category) => {
    setFormMode("edit");
    setFormType("category");
    setSelectedItem(category);
    setIsFormModalOpen(true);
  };

  const handleOpenEditSubcategory = (subcategory) => {
    setFormMode("edit");
    setFormType("subcategory");
    setSelectedItem(subcategory);
    setIsFormModalOpen(true);
  };

  /*
   * ==============================
   * CERRAR FORMULARIO
   * ==============================
   */

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedItem(null);
  };

  /*
   * ==============================
   * GUARDAR
   * ==============================
   */

  const handleSave = async (data) => {
    try {
      if (formType === "category" && formMode === "create") {
        await categoryService.createCategory(data);
        await loadCategories();
        handleCloseFormModal();
      }

      if (formType === "category" && formMode === "edit") {
        await categoryService.updateCategory(data.id_categoria, data);
        await loadCategories();
        handleCloseFormModal();
      }

      if (formType === "subcategory" && formMode === "create") {
        await subcategoryService.createSubcategory(data);
        await loadSubcategories();
        handleCloseFormModal();
      }

      if (formType === "subcategory" && formMode === "edit") {
        await subcategoryService.updateSubcategory(data.id_subcategoria, data);
        await loadSubcategories();
        handleCloseFormModal();
      }
    } catch (error) {
      console.error("Error al guardar la categoria:", error);
    }
  };

  /*
   * ==============================
   * ELIMINAR CATEGORÍA
   * ==============================
   */

  const handleDeleteCategory = async (category) => {
    setFormType("category");
    setSelectedCategory(category);
    setIsConfirmModalOpen(true);
  };

  /*
   * ==============================
   * ELIMINAR SUBCATEGORÍA
   * ==============================
   */

  const handleDeleteSubcategory = async (subcategory) => {
    setFormType("subcategory");
    setSelectedCategory(subcategory);
    setIsConfirmModalOpen(true);
  };

  /*
   * ==============================
   * CONFIRMAR ELIMINACIÓN
   * ==============================
   */

  const handleConfirmDeleteModal = async () => {
    try {
      if (formType === "category") {
        await categoryService.deleteCategory(selectedCategory.id_categoria);
        await loadCategories();
      }

      if (formType === "subcategory") {
        await subcategoryService.deleteSubcategory(
          selectedCategory.id_subcategoria,
        );
        await loadSubcategories();
      }

      setIsConfirmModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  /*
   * ==============================
   * COLUMNAS CATEGORÍAS
   * ==============================
   */

  const categoryColumns = [
    {
      header: "Nombre",
      accessor: "nombre",
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (category) => (
        <div className="category-actions">
          <button
            type="button"
            className="category-action-button"
            aria-label="Editar categoría"
            onClick={() => handleOpenEditCategory(category)}
          >
            <i className="bi bi-pencil"></i>
          </button>

          <button
            type="button"
            className="category-action-button category-action-danger"
            aria-label="Eliminar categoría"
            onClick={() => handleDeleteCategory(category)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  /*
   * ==============================
   * COLUMNAS SUBCATEGORÍAS
   * ==============================
   */

  const subcategoryColumns = [
    {
      header: "Nombre",
      accessor: "nombre",
    },
    {
      header: "Categoría",
      accessor: "nombre_categoria",
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (subcategory) => (
        <div className="category-actions">
          <button
            type="button"
            className="category-action-button"
            aria-label="Editar subcategoría"
            onClick={() => handleOpenEditSubcategory(subcategory)}
          >
            <i className="bi bi-pencil"></i>
          </button>

          <button
            type="button"
            className="category-action-button category-action-danger"
            onClick={() => handleDeleteSubcategory(subcategory)}
            aria-label="Eliminar subcategoría"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  /*
   * ==============================
   * BUSCAR CATEGORÍAS
   * ==============================
   */

  const handleSearchCategory = async () => {
    setCategoryPage(1);

    try {
      const response = await categoryService.getCategories(
        1,
        5,
        categorySearch,
      );

      setCategories(response.data);
      setCategoryTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error al buscar categorías:", error);
    }
  };

  /*
   * ==============================
   * BUSCAR SUBCATEGORÍAS
   * ==============================
   */

  const handleSearchSubcategory = async () => {
    setSubcategoryPage(1);

    try {
      const response = await subcategoryService.getSubcategories(
        1,
        5,
        subcategorySearch,
      );

      setSubcategories(response.data);
      setSubcategoryTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error al buscar subcategorías:", error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="category-modal-overlay">
        <section className="category-modal">
          {/* HEADER */}

          <header className="category-modal-header">
            <div className="category-modal-title">
              <div className="category-modal-title-icon">
                <i className="bi bi-tags"></i>
              </div>

              <div>
                <h2>Gestión de categorías</h2>
                <p>Administrá categorías y subcategorías</p>
              </div>
            </div>

            <button
              type="button"
              className="category-modal-close"
              onClick={handleCloseModal}
              aria-label="Cerrar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </header>

          {/* TABS */}

          <div className="category-modal-tabs">
            <button
              type="button"
              className={`category-modal-tab ${
                activeTab === "categories" ? "active" : ""
              }`}
              onClick={() => setActiveTab("categories")}
            >
              <i className="bi bi-tags"></i>

              <span>Categorías</span>

              <span className="category-tab-count">{categories.length}</span>
            </button>

            <button
              type="button"
              className={`category-modal-tab ${
                activeTab === "subcategories" ? "active" : ""
              }`}
              onClick={() => setActiveTab("subcategories")}
            >
              <i className="bi bi-tag"></i>

              <span>Subcategorías</span>

              <span className="category-tab-count">{subcategories.length}</span>
            </button>
          </div>

          {/* CONTENIDO */}

          <div className="category-modal-content">
            {/* CATEGORÍAS */}

            {activeTab === "categories" && (
              <div className="category-section">
                <div className="category-section-header">
                  <div>
                    <h3>Categorías</h3>
                    <p>Organizá los productos de tu catálogo.</p>
                  </div>

                  <button
                    type="button"
                    className="category-add-button"
                    onClick={handleOpenCreateCategory}
                  >
                    <i className="bi bi-plus-lg"></i>

                    <span>Agregar categoría</span>
                  </button>
                </div>

                <div className="category-toolbar">
                  <SearchBar
                    value={categorySearch}
                    onChange={setCategorySearch}
                    placeholder="Buscar categorías..."
                    onSearch={handleSearchCategory}
                  />
                </div>

                <DataTable
                  columns={categoryColumns}
                  data={categories}
                  rowKey="id_categoria"
                />

                <Pagination
                  page={categoryPage}
                  totalPages={categoryTotalPages}
                  onPageChange={setCategoryPage}
                />
              </div>
            )}

            {/* SUBCATEGORÍAS */}

            {activeTab === "subcategories" && (
              <div className="category-section">
                <div className="category-section-header">
                  <div>
                    <h3>Subcategorías</h3>
                    <p>Organizá los productos dentro de cada categoría.</p>
                  </div>

                  <button
                    type="button"
                    className="category-add-button"
                    onClick={handleOpenCreateSubcategory}
                  >
                    <i className="bi bi-plus-lg"></i>

                    <span>Agregar subcategoría</span>
                  </button>
                </div>

                <div className="category-toolbar">
                  <SearchBar
                    value={subcategorySearch}
                    onChange={setSubcategorySearch}
                    placeholder="Buscar subcategorías..."
                    onSearch={handleSearchSubcategory}
                  />
                </div>

                <DataTable
                  columns={subcategoryColumns}
                  data={subcategories}
                  rowKey="id_subcategoria"
                />

                <Pagination
                  page={subcategoryPage}
                  totalPages={subcategoryTotalPages}
                  onPageChange={setSubcategoryPage}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL DE FORMULARIO */}

      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSave}
        mode={formMode}
        type={formType}
        item={selectedItem}
        categories={categories}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title={
          formType === "category"
            ? "¿Eliminar categoría?"
            : "¿Eliminar subcategoría?"
        }
        message={`¿Estás seguro de que querés eliminar "${selectedCategory?.nombre}"?`}
        onConfirm={handleConfirmDeleteModal}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setSelectedCategory(null);
        }}
      />
    </>
  );
}

export default CategoryModal;
