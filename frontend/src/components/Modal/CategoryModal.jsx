import { useState } from "react";

import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import Pagination from "../Pagination";
import CategoryFormModal from "./CategoryFormModal";
import * as categoryService from "../../services/category.service.js";

import "./CategoryModal.css";

function CategoryModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("categories");

  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");

  const [categoryPage, setCategoryPage] = useState(1);
  const [subcategoryPage, setSubcategoryPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [formMode, setFormMode] = useState("create");
  const [formType, setFormType] = useState("category");
  const [selectedItem, setSelectedItem] = useState(null);

  if (!isOpen) {
    return null;
  }

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
   *
   * Por ahora solamente simulamos
   * el guardado.
   *
   * Después acá vamos a actualizar
   * el estado desde el backend.
   */

  const handleSave = async (data) => {
    try {
      if (formType === "category" && formMode === "create") {
        await categoryService.createCategory(data);

        console.log("Categoria creada correctamente");

        handleCloseFormModal();
      }
    } catch (error) {
      console.error("Error al guardar la categoria: ", error);
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
   * FILTROS TEMPORALES
   * ==============================
   */

  const filteredCategories = categories.filter((category) =>
    category.nombre.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const filteredSubcategories = subcategories.filter((subcategory) =>
    `${subcategory.nombre} ${subcategory.nombre_categoria}`
      .toLowerCase()
      .includes(subcategorySearch.toLowerCase()),
  );

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
              onClick={onClose}
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
                    onSearch={() => {}}
                  />
                </div>

                <DataTable
                  columns={categoryColumns}
                  data={filteredCategories}
                  rowKey="id_categoria"
                />

                <Pagination
                  page={categoryPage}
                  totalPages={1}
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
                    onSearch={() => {}}
                  />
                </div>

                <DataTable
                  columns={subcategoryColumns}
                  data={filteredSubcategories}
                  rowKey="id_subcategoria"
                />

                <Pagination
                  page={subcategoryPage}
                  totalPages={1}
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
    </>
  );
}

export default CategoryModal;
