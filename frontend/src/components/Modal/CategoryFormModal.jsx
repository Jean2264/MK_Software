import { useEffect, useRef, useState } from "react";

import "./CategoryFormModal.css";
import Combobox from "../Combobox";
import * as categoryService from "../../services/category.service.js";

function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  mode = "create",
  type = "category",
  item = null,
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Datos y paginación del Combobox
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryHasMore, setCategoryHasMore] = useState(true);
  const [categorySearch, setCategorySearch] = useState("");

  // Evita solicitudes simultáneas de la misma carga
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);

  const isEdit = mode === "edit";
  const isSubcategory = type === "subcategory";

  const isFormValid = isSubcategory
    ? name.trim() !== "" && categoryId !== ""
    : name.trim() !== "";

  /*
   * ==============================
   * CARGAR CATEGORÍAS PAGINADAS
   * ==============================
   */

  const loadCategoryOptions = async (page = 1, search = categorySearch) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setCategoryLoading(true);

    const requestId = requestIdRef.current;

    try {
      const response = await categoryService.getCategories(page, 10, search);

      if (requestId !== requestIdRef.current) return;

      setCategoryOptions((previous) =>
        page === 1
          ? response.data
          : [
              ...previous,
              ...response.data.filter(
                (category) =>
                  !previous.some(
                    (existing) =>
                      existing.id_categoria === category.id_categoria,
                  ),
              ),
            ],
      );

      setCategoryPage(page);
      setCategoryHasMore(page < response.pagination.totalPages);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setCategoryLoading(false);
      }
    }
  };

  const handleCategorySearch = (search) => {
    // Invalidar solicitudes anteriores.
    requestIdRef.current += 1;
    loadingRef.current = false;

    // Reiniciar la paginación y los resultados.
    setCategoryOptions([]);
    setCategoryPage(1);
    setCategoryHasMore(true);
    setCategoryLoading(false);

    // Solicitar los resultados de la nueva búsqueda.
    loadCategoryOptions(1, search);
  };

  /*
   * ==============================
   * ABRIR Y REINICIAR EL FORMULARIO
   * ==============================
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(item && isEdit ? item.nombre || "" : "");

    setCategoryId(
      item && isEdit && isSubcategory ? String(item.id_categoria ?? "") : "",
    );

    // Invalidar solicitudes anteriores
    requestIdRef.current += 1;
    loadingRef.current = false;
    setCategoryOptions([]);
    setCategoryPage(1);
    setCategoryHasMore(true);
    setCategoryLoading(false);

    if (isSubcategory) {
      loadCategoryOptions(1);
    }
  }, [isOpen, item, isEdit, isSubcategory]);

  /*
   * ==============================
   * CERRAR Y LIMPIAR
   * ==============================
   */

  const handleClose = () => {
    requestIdRef.current += 1;
    loadingRef.current = false;
    setCategoryLoading(false);
    onClose();
  };

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

  /*
   * ==============================
   * GUARDAR
   * ==============================
   */

  const handleSubmit = async (event) => {
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

    await onSave(data);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="category-form-modal-overlay">
      <section className="category-form-modal">
        {/* HEADER */}

        <header className="category-form-modal-header">
          <div className="category-form-modal-title">
            <div className="category-form-modal-icon">
              <i className={isSubcategory ? "bi bi-tag" : "bi bi-tags"} />
            </div>

            <div>
              <h2>{title}</h2>
            </div>
          </div>

          <button
            type="button"
            className="category-form-modal-close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <i className="bi bi-x-lg" />
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

          {/* CATEGORÍA DE LA SUBCATEGORÍA */}

          {isSubcategory && (
            <div className="category-form-group">
              <label htmlFor="subcategory-category">Categoría</label>

              <Combobox
                options={categoryOptions}
                value={categoryId}
                onChange={(selectedId) => setCategoryId(String(selectedId))}
                placeholder="Seleccionar categoría"
                getOptionValue={(category) => category.id_categoria}
                getOptionLabel={(category) => category.nombre}
                onLoadMore={() => loadCategoryOptions(categoryPage + 1)}
                loading={categoryLoading}
                hasMore={categoryHasMore}
                onSearch={handleCategorySearch}
              />
            </div>
          )}

          {/* ACCIONES */}

          <footer className="category-form-actions">
            <button
              type="button"
              className="category-form-cancel"
              onClick={handleClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="category-form-save"
              disabled={!isFormValid}
            >
              <i className="bi bi-check-lg" />

              {isEdit ? "Guardar cambios" : "Guardar"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default CategoryFormModal;
