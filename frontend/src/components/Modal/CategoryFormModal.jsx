import { useEffect, useState } from "react";

import "./CategoryFormModal.css";
import Combobox from "../Combobox";

function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  mode = "create",
  type = "category",
  item = null,
  categories = [],
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const isEdit = mode === "edit";
  const isSubcategory = type === "subcategory";

  const isFormValid = isSubcategory
    ? name.trim() !== "" && categoryId !== ""
    : name.trim() !== "";

  /*
   * ==============================
   * CARGAR DATOS EN MODO EDICIÓN
   * ==============================
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (item && isEdit) {
      setName(item.nombre || "");

      if (isSubcategory) {
        setCategoryId(item.id_categoria?.toString() || "");
      } else {
        setCategoryId("");
      }

      return;
    }

    setName("");
    setCategoryId("");
  }, [isOpen, item, isEdit, isSubcategory]);

  if (!isOpen) {
    return null;
  }

  /*
   * ==============================
   * TÍTULOS
   * ==============================
   */

  const title = isEdit
    ? isSubcategory
      ? "Editar subcategoría"
      : "Editar categoría"
    : isSubcategory
      ? "Agregar subcategoría"
      : "Agregar categoría";

  const categoryOptions = categories.map((category) => ({
    id: category.id_categoria,
    label: category.nombre,
  }));

  /*
   * ==============================
   * SUBMIT
   * ==============================
   */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (isSubcategory && !categoryId) {
      return;
    }

    const data = {
      nombre: name.trim(),
    };

    if (isSubcategory) {
      data.id_categoria = Number(categoryId);
    }

    if (isEdit && item) {
      if (isSubcategory) {
        data.id_subcategoria = item.id_subcategoria;
      } else {
        data.id_categoria = item.id_categoria;
      }
    }

    onSave(data);
  };

  return (
    <div className="category-form-modal-overlay">
      <section className="category-form-modal">
        {/* HEADER */}

        <header className="category-form-modal-header">
          <div className="category-form-modal-title">
            <div className="category-form-modal-icon">
              <i className={isSubcategory ? "bi bi-tag" : "bi bi-tags"}></i>
            </div>

            <div>
              <h2>{title}</h2>
            </div>
          </div>

          <button
            type="button"
            className="category-form-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        {/* FORMULARIO */}

        <form className="category-form" onSubmit={handleSubmit}>
          {/* NOMBRE */}

          <div className="category-form-group">
            <label htmlFor="category-name">Nombre</label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={
                isSubcategory
                  ? "Nombre de la subcategoría"
                  : "Nombre de la categoría"
              }
              autoFocus
            />
          </div>

          {/* CATEGORÍA */}

          {isSubcategory && (
            <div className="category-form-group">
              <label htmlFor="subcategory-category">Categoría</label>
              <Combobox
                options={categoryOptions}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Selecctionar categoria"
              />
            </div>
          )}

          {/* ACTIONS */}

          <footer className="category-form-actions">
            <button
              type="button"
              className="category-form-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="category-form-save"
              disabled={!isFormValid}
            >
              <i className="bi bi-check-lg"></i>

              {isEdit ? "Guardar cambios" : "Guardar"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default CategoryFormModal;
