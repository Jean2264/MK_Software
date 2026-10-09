import { useRef, useState, useEffect } from "react";
import * as productService from "../../services/product.service.js";
import * as categoryService from "../../services/category.service.js";
import * as subcategoryService from "../../services/subcategory.service.js";

import "./ProductModal.css";
import Combobox from "../Combobox.jsx";

//Validaciones de campos

function isValidBarcode(value) {
  const barcode = value.trim();

  //por ahora, solo admitimos digitos
  if (!/^\d+$/.test(barcode)) {
    return false;
  }

  //formatos comerciales admitidos
  const validLengths = [8, 12, 13, 14];

  if (!validLengths.includes(barcode.length)) {
    return false;
  }

  //verifico el codigo de control GS1/GTIN
  const digits = barcode.split("").map(Number);
  const checkDigit = digits.pop();

  const sum = digits.reverse().reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 3 : 1);
  }, 0);

  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === expectedCheckDigit;
}

function ProductModal({
  isOpen,
  onClose,
  mode = "create",
  handleProductCreated,
}) {
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState("idle");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [categoryPage, setCategoryPage] = useState(1);
  const [subcategoryPage, setSubcategoryPage] = useState(1);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);

  const [categoryHasMore, setCategoryHasMore] = useState(false);
  const [subcategoryHasMore, setSubcategoryHasMore] = useState(false);

  const categoryRequestRef = useRef(0);
  const subcategoryRequestRef = useRef(0);

  const loadCategories = async (page = 1, search = "") => {
    const requestId = ++categoryRequestRef.current;

    setCategoryLoading(true);

    try {
      const response = await categoryService.getCategories(page, 10, search);

      if (requestId !== categoryRequestRef.current) return;

      const newOptions = response.data ?? [];

      setCategoryOptions((previous) => {
        if (page === 1) return newOptions;

        const existingIds = new Set(previous.map((item) => item.id_categoria));

        return [
          ...previous,
          ...newOptions.filter((item) => !existingIds.has(item.id_categoria)),
        ];
      });

      setCategoryPage(page);
      setCategoryHasMore(page < (response.pagination?.totalPages ?? 1));
    } catch (error) {
      if (requestId === categoryRequestRef.current) {
        console.error("Error al obtener categorías:", error);
      }
    } finally {
      if (requestId === categoryRequestRef.current) {
        setCategoryLoading(false);
      }
    }
  };

  const loadSubcategories = async (
    selectedCategoryId,
    page = 1,
    search = "",
  ) => {
    if (!selectedCategoryId) return;

    const requestId = ++subcategoryRequestRef.current;

    setSubcategoryLoading(true);

    try {
      const response = await subcategoryService.getSubcategoriesByCategoryId(
        selectedCategoryId,
        page,
        10,
        search,
      );

      if (requestId !== subcategoryRequestRef.current) return;

      const newOptions = response.data ?? [];

      setSubcategoryOptions((previous) => {
        if (page === 1) return newOptions;

        const existingIds = new Set(
          previous.map((item) => item.id_subcategoria),
        );

        return [
          ...previous,
          ...newOptions.filter(
            (item) => !existingIds.has(item.id_subcategoria),
          ),
        ];
      });

      setSubcategoryPage(page);
      setSubcategoryHasMore(page < (response.pagination?.totalPages ?? 1));
    } catch (error) {
      if (requestId === subcategoryRequestRef.current) {
        console.error("Error al obtener subcategorías:", error);
      }
    } finally {
      if (requestId === subcategoryRequestRef.current) {
        setSubcategoryLoading(false);
      }
    }
  };

  const handleCategoryChange = (selectedId) => {
    subcategoryRequestRef.current++;

    setCategoryId(String(selectedId));
    setSubcategoryId("");
    setSubcategoryOptions([]);
    setSubcategoryPage(1);
    setSubcategoryHasMore(false);
  };

  const handleCategorySearch = (search) => {
    loadCategories(1, search);
  };

  const handleSubcategorySearch = (search) => {
    if (!categoryId) return;

    loadSubcategories(categoryId, 1, search);
  };

  const fileInputRef = useRef(null);

  const titles = {
    create: "Agregar producto",
    view: "Inspección de producto",
    edit: "Editar producto",
  };

  const isViewMode = mode === "view";

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        imagen: "La imagen debe ser JPG, PNG o WebP.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((previous) => ({
        ...previous,
        imagen: "La imagen no puede superar los 5 MB.",
      }));

      event.target.value = "";
      return;
    }

    setErrors((previous) => ({
      ...previous,
      imagen: "",
    }));

    setImageFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSelectImage = () => {
    if (isLoading) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (isLoading) {
      return;
    }
    setErrors((previous) => ({
      ...previous,
      imagen: "",
    }));

    setImage(null);
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }
    const form = event.currentTarget;

    const nameInput = form.querySelector("#product-name");
    const barcodeInput = form.querySelector("#product-barcode");
    const retailPriceInput = form.querySelector("#product-retail-price");
    const wholesalePriceInput = form.querySelector("#product-wholesale-price");
    const wholesaleMinInput = form.querySelector("#product-wholesale-min");

    const name = nameInput.value.trim();
    const barcode = barcodeInput.value.trim();
    const wholesalePrice = wholesalePriceInput.value.trim();
    const wholesaleMin = wholesaleMinInput.value.trim();
    const retailPrice = retailPriceInput.valueAsNumber;

    const newErrors = {};

    if (!name) {
      newErrors.nombre = "El nombre del producto es obligatorio.";
    }

    if (!isValidBarcode(barcode)) {
      newErrors.codigoBarras =
        "Ingresá un código comercial válido de 8, 12, 13 o 14 dígitos.";
    }

    if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
      newErrors.precioMinorista =
        "El precio minorista debe ser mayor que cero.";
    }
    if (wholesalePrice !== "") {
      const value = Number(wholesalePrice);

      if (!Number.isFinite(value) || value < 0 || value > 999999999.99) {
        newErrors.precioMayorista =
          "El precio mayorista debe ser igual o mayor que cero y no superar el máximo permitido.";
      }
    }

    if (wholesaleMin !== "") {
      const value = Number(wholesaleMin);

      if (!Number.isInteger(value) || value < 0) {
        newErrors.cantidadMinMayorista =
          "La cantidad mínima debe ser un número entero igual o mayor que cero.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
    setStatus("loading");

    const formData = new FormData();

    formData.append("nombre", document.getElementById("product-name").value);

    formData.append(
      "codigoBarras",
      document.getElementById("product-barcode").value,
    );

    formData.append(
      "precioMinorista",
      document.getElementById("product-retail-price").value,
    );

    formData.append("idSubcategoria", subcategoryId || "");

    formData.append(
      "precioMayorista",
      document.getElementById("product-wholesale-price").value || "",
    );

    formData.append(
      "cantidadMinMayorista",
      document.getElementById("product-wholesale-min").value,
    );

    if (imageFile) {
      formData.append("imagen", imageFile);
    }

    try {
      await productService.createProduct(formData);

      await handleProductCreated();

      setStatus("success");
    } catch (error) {
      console.error(error);

      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
  };

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const timeout = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [status, onClose]);

  useEffect(() => {
    if (isOpen) return;

    // Invalidar solicitudes pendientes.
    categoryRequestRef.current++;
    subcategoryRequestRef.current++;

    // Limpiar selecciones.
    setCategoryId("");
    setSubcategoryId("");

    // Limpiar opciones y paginación.
    setCategoryOptions([]);
    setSubcategoryOptions([]);
    setCategoryPage(1);
    setSubcategoryPage(1);
    setCategoryHasMore(false);
    setSubcategoryHasMore(false);

    // Limpiar imagen y estado del modal.
    setImage(null);
    setImageFile(null);
    setStatus("idle");
    setErrors({});

    // Limpiar los campos del formulario.
    document.getElementById("product-form")?.reset();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadCategories();
  }, [isOpen]);

  useEffect(() => {
    subcategoryRequestRef.current++;

    setSubcategoryOptions([]);
    setSubcategoryPage(1);
    setSubcategoryHasMore(false);
    setSubcategoryId("");

    if (!categoryId || !isOpen) return;

    loadSubcategories(categoryId, 1, "");
  }, [categoryId, isOpen]);

  const renderResult = () => {
    if (isSuccess) {
      return (
        <div className="product-modal-result product-modal-result-success">
          <div className="product-result-icon">
            <i className="bi bi-check-lg"></i>
          </div>

          <h2>
            {mode === "edit"
              ? "Producto actualizado correctamente"
              : "Producto guardado correctamente"}
          </h2>

          <p>
            {mode === "edit"
              ? "Los cambios fueron guardados correctamente."
              : "El producto fue agregado al catálogo."}
          </p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="product-modal-result product-modal-result-error">
          <div className="product-result-icon">
            <i className="bi bi-exclamation-lg"></i>
          </div>

          <div className="error-info">
            <h2>No se pudo guardar el producto</h2>

            <p>
              Ocurrió un error al guardar el producto.
              <br />
              Por favor, intentá nuevamente.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };
  if (!isOpen) {
    return null;
  }

  return (
    <div className="product-modal-overlay">
      <section className="product-modal">
        <header className="product-header">
          <h2>{titles[mode]}</h2>

          <button
            type="button"
            className="product-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={isLoading}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        <div className="product-modal-content">
          {isSuccess ? (
            renderResult()
          ) : (
            <>
              {isError && renderResult()}

              <form
                id="product-form"
                className="product-modal-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="product-modal-image-container">
                  {image ? (
                    <div className="product-image-preview-container">
                      <div className="product-image-preview">
                        <img src={image} alt="Vista previa del producto" />

                        {!isViewMode && (
                          <button
                            type="button"
                            className="product-image-remove"
                            onClick={handleRemoveImage}
                            aria-label="Eliminar imagen"
                            disabled={isLoading}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        )}
                      </div>

                      {!isViewMode && (
                        <button
                          type="button"
                          className="product-image-button"
                          onClick={handleSelectImage}
                          disabled={isLoading}
                        >
                          <i className="bi bi-pencil"></i>
                          Editar imagen
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="product-modal-image-placeholder">
                      <i className="bi bi-image"></i>

                      <span>Imagen del producto</span>

                      {!isViewMode && (
                        <button
                          type="button"
                          className="product-image-button"
                          onClick={handleSelectImage}
                          disabled={isLoading}
                        >
                          <i className="bi bi-plus-lg"></i>
                          Agregar imagen
                        </button>
                      )}
                      {errors.imagen && (
                        <small className="product-field-error">
                          {errors.imagen}
                        </small>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    hidden
                    disabled={isLoading}
                  />
                </div>

                <div className="product-form-grid">
                  <div className="product-form-group">
                    <label htmlFor="product-code">Código de producto</label>

                    <input
                      id="product-code"
                      type="text"
                      placeholder="Se generará automáticamente"
                      disabled
                    />
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="product-name">Nombre</label>

                    <input
                      id="product-name"
                      type="text"
                      placeholder="Nombre de producto"
                      required
                      maxLength={120}
                      disabled={isViewMode || isLoading}
                    />
                    {errors.nombre && (
                      <small className="product-field-error">
                        {errors.nombre}
                      </small>
                    )}
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="product-barcode">Código de barras</label>

                    <input
                      id="product-barcode"
                      type="text"
                      placeholder="Código de barras"
                      required
                      inputMode="numeric"
                      maxLength={14}
                      disabled={isViewMode || isLoading}
                    />
                    {errors.codigoBarras && (
                      <small className="product-field-error">
                        {errors.codigoBarras}
                      </small>
                    )}
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="product-category">Categoría</label>

                    <Combobox
                      options={categoryOptions}
                      value={categoryId}
                      onChange={handleCategoryChange}
                      placeholder="Seleccionar categoría"
                      getOptionValue={(category) => category.id_categoria}
                      getOptionLabel={(category) => category.nombre}
                      onSearch={handleCategorySearch}
                      onLoadMore={() => loadCategories(categoryPage + 1, "")}
                      loading={categoryLoading}
                      hasMore={categoryHasMore}
                    />
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="product-subcategory">Subcategoría</label>

                    <Combobox
                      options={subcategoryOptions}
                      value={subcategoryId}
                      onChange={(selectedId) =>
                        setSubcategoryId(String(selectedId))
                      }
                      placeholder={
                        categoryId
                          ? "Seleccionar subcategoría"
                          : "Primero seleccioná una categoría"
                      }
                      getOptionValue={(subcategory) =>
                        subcategory.id_subcategoria
                      }
                      getOptionLabel={(subcategory) => subcategory.nombre}
                      onSearch={handleSubcategorySearch}
                      onLoadMore={() =>
                        loadSubcategories(categoryId, subcategoryPage + 1, "")
                      }
                      loading={subcategoryLoading}
                      hasMore={subcategoryHasMore}
                      disabled={isViewMode || isLoading || !categoryId}
                    />
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="product-retail-price">
                      Precio minorista
                    </label>

                    <input
                      id="product-retail-price"
                      type="number"
                      required
                      min="0.01"
                      max="999999999.99"
                      step="0.01"
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E"].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder="0,00"
                      disabled={isViewMode || isLoading}
                    />
                    {errors.precioMinorista && (
                      <small className="product-field-error">
                        {errors.precioMinorista}
                      </small>
                    )}
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="product-wholesale-price">
                      Precio mayorista
                    </label>

                    <input
                      id="product-wholesale-price"
                      type="number"
                      min="0"
                      max="999999999.99"
                      step="0.01"
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E"].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder="Opcional"
                      disabled={isViewMode || isLoading}
                    />
                    {errors.precioMayorista && (
                      <small className="product-field-error">
                        {errors.precioMayorista}
                      </small>
                    )}
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="product-wholesale-min">
                      Cantidad mínima mayorista
                    </label>

                    <input
                      id="product-wholesale-min"
                      type="number"
                      min="0"
                      step="1"
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E", "."].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder="Opcional"
                      disabled={isViewMode || isLoading}
                    />
                    {errors.cantidadMinMayorista && (
                      <small className="product-field-error">
                        {errors.cantidadMinMayorista}
                      </small>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {!isViewMode && !isSuccess && !isError && (
          <footer className="product-modal-actions">
            <button
              type="button"
              className="product-modal-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="product-form"
              className="product-modal-save"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Guardando
                  <span className="saving-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </>
              ) : (
                "Guardar producto"
              )}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

export default ProductModal;
