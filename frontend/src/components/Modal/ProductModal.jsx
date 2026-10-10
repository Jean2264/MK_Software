import { useRef, useState, useEffect } from "react";

import * as productService from "../../services/product.service.js";
import * as categoryService from "../../services/category.service.js";
import * as subcategoryService from "../../services/subcategory.service.js";

import "./ProductModal.css";
import Combobox from "../Combobox.jsx";

// ======================================================
// VALIDACIONES
// ======================================================

// Valida códigos comerciales GTIN de 8, 12, 13 o 14 dígitos.
function isValidBarcode(value) {
  const barcode = value.trim();

  if (!/^\d+$/.test(barcode)) {
    return false;
  }

  const validLengths = [8, 12, 13, 14];

  if (!validLengths.includes(barcode.length)) {
    return false;
  }

  // Verifica el dígito de control GS1/GTIN.
  const digits = barcode.split("").map(Number);
  const checkDigit = digits.pop();

  const sum = digits.reverse().reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 3 : 1);
  }, 0);

  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === expectedCheckDigit;
}

// ======================================================
// COMPONENTE PRODUCT MODAL
// ======================================================

function ProductModal({
  isOpen,
  onClose,
  mode = "create",
  handleProductCreated,
  productId,
}) {
  // ------------------------------------------------------
  // ESTADOS DEL FORMULARIO
  // ------------------------------------------------------

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const [productCode, setProductCode] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    codigoBarras: "",
    precioMinorista: "",
    precioMayorista: "",
    cantidadMinMayorista: "",
  });

  // ------------------------------------------------------
  // ESTADOS DE LA IMAGEN
  // ------------------------------------------------------

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // ------------------------------------------------------
  // ESTADOS DE CATEGORÍAS Y SUBCATEGORÍAS
  // ------------------------------------------------------

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

  // Evitan que una respuesta antigua sobrescriba una búsqueda más reciente.
  const categoryRequestRef = useRef(0);
  const subcategoryRequestRef = useRef(0);
  // Conservan las opciones seleccionadas aunque cambie la página o la búsqueda.
  const selectedCategoryOptionRef = useRef(null);
  const selectedSubcategoryOptionRef = useRef(null);

  // Indica que se están cargando los datos del producto seleccionado.
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // ------------------------------------------------------
  // CONSTANTES DERIVADAS DEL MODO Y ESTADO
  // ------------------------------------------------------

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

  // ------------------------------------------------------
  // CARGA DE CATEGORÍAS
  // ------------------------------------------------------

  const loadCategories = async (page = 1, search = "") => {
    const requestId = ++categoryRequestRef.current;

    setCategoryLoading(true);

    try {
      const response = await categoryService.getCategories(page, 10, search);

      // Ignora la respuesta si se inició otra solicitud después.
      if (requestId !== categoryRequestRef.current) {
        return;
      }

      const newOptions = response.data ?? [];

      setCategoryOptions((previous) => {
        if (page === 1) {
          const selectedOption = selectedCategoryOptionRef.current;

          // Conserva la categoría seleccionada si no viene en la respuesta.
          if (
            selectedOption &&
            !newOptions.some(
              (item) =>
                String(item.id_categoria) ===
                String(selectedOption.id_categoria),
            )
          ) {
            return [selectedOption, ...newOptions];
          }

          return newOptions;
        }

        // Evita duplicados al cargar páginas adicionales.
        const existingIds = new Set(
          previous.map((item) => String(item.id_categoria)),
        );

        const uniqueOptions = newOptions.filter(
          (item) => !existingIds.has(String(item.id_categoria)),
        );

        return [...previous, ...uniqueOptions];
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

  // ------------------------------------------------------
  // CARGA DE SUBCATEGORÍAS
  // ------------------------------------------------------

  const loadSubcategories = async (
    selectedCategoryId,
    page = 1,
    search = "",
  ) => {
    if (!selectedCategoryId) {
      return;
    }

    const requestId = ++subcategoryRequestRef.current;

    setSubcategoryLoading(true);

    try {
      const response = await subcategoryService.getSubcategoriesByCategoryId(
        selectedCategoryId,
        page,
        10,
        search,
      );

      // Evita usar respuestas de una categoría o búsqueda anterior.
      if (requestId !== subcategoryRequestRef.current) {
        return;
      }

      const newOptions = response.data ?? [];

      setSubcategoryOptions((previous) => {
        if (page === 1) {
          const selectedOption = selectedSubcategoryOptionRef.current;

          // Conserva la subcategoría seleccionada si no viene en la respuesta.
          if (
            selectedOption &&
            !newOptions.some(
              (item) =>
                String(item.id_subcategoria) ===
                String(selectedOption.id_subcategoria),
            )
          ) {
            return [selectedOption, ...newOptions];
          }

          return newOptions;
        }

        // Evita duplicados al cargar páginas adicionales.
        const existingIds = new Set(
          previous.map((item) => String(item.id_subcategoria)),
        );

        const uniqueOptions = newOptions.filter(
          (item) => !existingIds.has(String(item.id_subcategoria)),
        );

        return [...previous, ...uniqueOptions];
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

  // ------------------------------------------------------
  // CARGA DEL PRODUCTO PARA INSPECCIÓN O EDICIÓN
  // ------------------------------------------------------

  const loadProduct = async () => {
    setIsLoadingProduct(true);

    try {
      const product = await productService.getProductById(productId);

      setProductCode(product.codigo_producto ?? "");

      setFormData({
        nombre: product.nombre ?? "",
        codigoBarras: product.codigo_barras ?? "",
        precioMinorista: product.precio_minorista ?? "",
        precioMayorista: product.precio_mayorista ?? "",
        cantidadMinMayorista: product.cantidad_min_mayorista ?? "",
      });

      const selectedCategoryId = String(product.id_categoria ?? "");
      const selectedSubcategoryId = String(product.id_subcategoria ?? "");

      // Guarda las opciones originales para que las cargas paginadas
      // no eliminen las etiquetas de la categoría y subcategoría actuales.
      selectedCategoryOptionRef.current = selectedCategoryId
        ? {
            id_categoria: product.id_categoria,
            nombre: product.nombre_categoria ?? "",
          }
        : null;

      selectedSubcategoryOptionRef.current = selectedSubcategoryId
        ? {
            id_subcategoria: product.id_subcategoria,
            nombre: product.nombre_subcategoria ?? "",
          }
        : null;

      setCategoryId(selectedCategoryId);
      setSubcategoryId(selectedSubcategoryId);

      // Conserva las opciones seleccionadas aunque no estén en la primera página.
      if (selectedCategoryId) {
        setCategoryOptions((previous) => {
          const alreadyExists = previous.some(
            (item) => String(item.id_categoria) === selectedCategoryId,
          );

          if (alreadyExists) {
            return previous;
          }

          return [
            {
              id_categoria: product.id_categoria,
              nombre: product.nombre_categoria ?? "",
            },
            ...previous,
          ];
        });
      }

      if (selectedSubcategoryId) {
        setSubcategoryOptions((previous) => {
          const alreadyExists = previous.some(
            (item) => String(item.id_subcategoria) === selectedSubcategoryId,
          );

          if (alreadyExists) {
            return previous;
          }

          return [
            {
              id_subcategoria: product.id_subcategoria,
              nombre: product.nombre_subcategoria ?? "",
            },
            ...previous,
          ];
        });
      }

      // Convierte las rutas relativas de las imágenes en URLs completas.
      setImage(
        product.imagen
          ? product.imagen.startsWith("http")
            ? product.imagen
            : `http://localhost:3000${product.imagen}`
          : null,
      );
    } catch (error) {
      console.error("Error al cargar el producto:", error);
    } finally {
      setIsLoadingProduct(false);
    }
  }; // ======================================================
  // MANEJADORES DE CATEGORÍA Y SUBCATEGORÍA
  // ======================================================

  // Se ejecuta cuando el usuario selecciona otra categoría.
  // Actualiza la categoría y reinicia la subcategoría anterior.
  const handleCategoryChange = (selectedId) => {
    const normalizedId = String(selectedId);

    // Conserva la etiqueta de la categoría que el usuario seleccionó.
    selectedCategoryOptionRef.current =
      categoryOptions.find(
        (item) => String(item.id_categoria) === normalizedId,
      ) ?? null;

    // La subcategoría anterior ya no corresponde a la nueva categoría.
    selectedSubcategoryOptionRef.current = null;

    subcategoryRequestRef.current++;

    setCategoryId(normalizedId);
    setSubcategoryId("");
    setSubcategoryOptions([]);
    setSubcategoryPage(1);
    setSubcategoryHasMore(false);
  };
  // Busca categorías según el texto ingresado en el Combobox.
  const handleCategorySearch = (search) => {
    loadCategories(1, search);
  };

  // Busca subcategorías dentro de la categoría seleccionada.
  const handleSubcategorySearch = (search) => {
    if (!categoryId) {
      return;
    }

    loadSubcategories(categoryId, 1, search);
  };

  // ======================================================
  // MANEJADORES DE LOS CAMPOS
  // ======================================================

  // Actualiza el campo correspondiente dentro de formData.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Valida y muestra una vista previa de la imagen seleccionada.
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

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

  // Abre el selector de archivos.
  const handleSelectImage = () => {
    if (isLoading || isLoadingProduct || isViewMode) {
      return;
    }

    fileInputRef.current?.click();
  };

  // Elimina la imagen seleccionada y su vista previa.
  const handleRemoveImage = () => {
    if (isLoading || isLoadingProduct || isViewMode) {
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

  // ======================================================
  // ENVÍO Y VALIDACIÓN DEL FORMULARIO
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "loading" || isLoadingProduct) {
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

    // Validación del nombre.
    if (!name) {
      newErrors.nombre = "El nombre del producto es obligatorio.";
    }

    // Validación del código de barras.
    if (!isValidBarcode(barcode)) {
      newErrors.codigoBarras =
        "Ingresá un código comercial válido de 8, 12, 13 o 14 dígitos.";
    }

    // Validación del precio minorista.
    if (
      !Number.isFinite(retailPrice) ||
      retailPrice <= 0 ||
      retailPrice > 999999999.99
    ) {
      newErrors.precioMinorista =
        "El precio minorista debe ser mayor que cero y no superar el máximo permitido.";
    }

    // El precio mayorista es opcional.
    if (wholesalePrice !== "") {
      const value = Number(wholesalePrice);

      if (!Number.isFinite(value) || value < 0 || value > 999999999.99) {
        newErrors.precioMayorista =
          "El precio mayorista debe ser igual o mayor que cero y no superar el máximo permitido.";
      }
    }

    // La cantidad mínima mayorista es opcional.
    if (wholesaleMin !== "") {
      const value = Number(wholesaleMin);

      if (!Number.isInteger(value) || value < 0) {
        newErrors.cantidadMinMayorista =
          "La cantidad mínima debe ser un número entero igual o mayor que cero.";
      }
    }

    // La subcategoría es obligatoria para crear o editar.
    if (!subcategoryId) {
      newErrors.subcategoria = "Seleccioná una subcategoría.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setStatus("loading");

    const data = new FormData();

    data.append("nombre", name);
    data.append("codigoBarras", barcode);
    data.append("precioMinorista", String(retailPrice));
    data.append("idSubcategoria", subcategoryId);
    data.append("precioMayorista", wholesalePrice);
    data.append("cantidadMinMayorista", wholesaleMin);

    if (imageFile) {
      data.append("imagen", imageFile);
    }

    try {
      if (mode === "create") {
        await productService.createProduct(data);
      } else if (mode === "edit") {
        await productService.updateProduct(productId, data);
      } else {
        throw new Error("El formulario no está en modo creación o edición.");
      }

      if (handleProductCreated) {
        await handleProductCreated();
      }

      setStatus("success");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      setStatus("error");
    }
  };

  // Permite volver al formulario después de un error.
  const handleRetry = () => {
    setStatus("idle");
  };

  // ======================================================
  // USE EFFECTS
  // ======================================================

  // useEffect para cargar el producto cuando se abre en modo
  // inspección o edición y existe un productId.
  useEffect(() => {
    if (!isOpen || (mode !== "view" && mode !== "edit") || !productId) {
      return;
    }

    loadProduct();
  }, [isOpen, mode, productId]);

  // useEffect para cerrar el modal dos segundos después del éxito.
  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const timeout = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [status, onClose]);

  // useEffect para limpiar los estados cuando el modal se cierra.
  useEffect(() => {
    if (isOpen) {
      return;
    }

    // Invalida solicitudes pendientes para evitar resultados antiguos.
    categoryRequestRef.current++;
    subcategoryRequestRef.current++;

    // Limpia los campos controlados por React.
    setProductCode("");

    setFormData({
      nombre: "",
      codigoBarras: "",
      precioMinorista: "",
      precioMayorista: "",
      cantidadMinMayorista: "",
    });

    // Limpia las selecciones y opciones de los Combobox.
    setCategoryId("");
    setSubcategoryId("");
    setCategoryOptions([]);
    setSubcategoryOptions([]);

    // Reinicia la paginación.
    selectedCategoryOptionRef.current = null;
    selectedSubcategoryOptionRef.current = null;
    setCategoryPage(1);
    setSubcategoryPage(1);
    setCategoryHasMore(false);
    setSubcategoryHasMore(false);

    // Limpia la imagen, los errores y el estado de envío.
    setImage(null);
    setImageFile(null);
    setStatus("idle");
    setErrors({});
    setIsLoadingProduct(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen]);

  // useEffect para cargar las categorías cuando se abre el modal.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadCategories();
  }, [isOpen]);

  // useEffect para cargar subcategorías cuando cambia la categoría.
  // No borra subcategoryId acá: así conserva la selección del producto
  // al cargar sus datos. handleCategoryChange sí la borra cuando el
  // usuario elige manualmente otra categoría.
  useEffect(() => {
    subcategoryRequestRef.current++;

    setSubcategoryPage(1);
    setSubcategoryHasMore(false);

    if (!categoryId || !isOpen) {
      setSubcategoryId("");
      return;
    }

    loadSubcategories(categoryId, 1, "");
  }, [categoryId, isOpen]);

  // ======================================================
  // RESULTADOS DE ÉXITO Y ERROR
  // ======================================================

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

            <button
              type="button"
              className="product-result-retry"
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return null;
  }; // Si el modal está cerrado, no renderiza su contenido.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="product-modal-overlay">
      <section className="product-modal">
        {/* Encabezado del modal */}
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

        {/* Contenido principal */}
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
                {/* Imagen del producto */}
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
                            disabled={isLoading || isLoadingProduct}
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
                          disabled={isLoading || isLoadingProduct}
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
                          disabled={isLoading || isLoadingProduct}
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
                    disabled={isLoading || isLoadingProduct}
                  />
                </div>

                {/* Campos del producto */}
                <div className="product-form-grid">
                  {/* Código generado automáticamente */}
                  <div className="product-form-group">
                    <label htmlFor="product-code">Código de producto</label>

                    <input
                      id="product-code"
                      value={productCode}
                      type="text"
                      placeholder="Se generará automáticamente"
                      disabled
                    />
                  </div>
                  {/* Nombre */}
                  <div className="product-form-group">
                    <label htmlFor="product-name">Nombre</label>

                    <input
                      id="product-name"
                      name="nombre"
                      type="text"
                      placeholder="Nombre de producto"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      maxLength={120}
                      disabled={isViewMode || isLoading || isLoadingProduct}
                    />

                    {errors.nombre && (
                      <small className="product-field-error">
                        {errors.nombre}
                      </small>
                    )}
                  </div>
                  {/* Código de barras */}
                  <div className="product-form-group">
                    <label htmlFor="product-barcode">Código de barras</label>

                    <input
                      id="product-barcode"
                      name="codigoBarras"
                      type="text"
                      placeholder="Código de barras"
                      value={formData.codigoBarras}
                      onChange={handleChange}
                      required
                      readOnly={mode !== "create"}
                      inputMode="numeric"
                      maxLength={14}
                      disabled={isViewMode || isLoading || isLoadingProduct}
                    />

                    {errors.codigoBarras && (
                      <small className="product-field-error">
                        {errors.codigoBarras}
                      </small>
                    )}
                  </div>

                  {/* Categoría */}
                  <div className="product-form-group">
                    <label htmlFor="product-category">Categoría</label>

                    {isViewMode ? (
                      <div className="product-form-readonly">
                        {categoryId && selectedCategoryOptionRef.current?.nombre
                          ? selectedCategoryOptionRef.current.nombre
                          : "Sin categoría asignada"}
                      </div>
                    ) : (
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
                        disabled={isLoading || isLoadingProduct}
                        selectedOptionFallback={
                          selectedCategoryOptionRef.current
                        }
                      />
                    )}
                  </div>

                  {/* Subcategoría */}
                  <div className="product-form-group">
                    <label htmlFor="product-subcategory">Subcategoría</label>

                    {isViewMode ? (
                      <div className="product-form-readonly">
                        {subcategoryId &&
                        selectedSubcategoryOptionRef.current?.nombre
                          ? selectedSubcategoryOptionRef.current.nombre
                          : "Sin subcategoría asignada"}
                      </div>
                    ) : (
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
                        disabled={isLoading || isLoadingProduct || !categoryId}
                        selectedOptionFallback={
                          selectedSubcategoryOptionRef.current
                        }
                      />
                    )}
                    {errors.subcategoria && (
                      <small className="product-field-error">
                        {errors.subcategoria}
                      </small>
                    )}
                  </div>

                  {/* Precio minorista */}
                  <div className="product-form-group">
                    <label htmlFor="product-retail-price">
                      Precio minorista
                    </label>

                    <input
                      id="product-retail-price"
                      name="precioMinorista"
                      type="number"
                      value={formData.precioMinorista}
                      onChange={handleChange}
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
                      disabled={isViewMode || isLoading || isLoadingProduct}
                    />

                    {errors.precioMinorista && (
                      <small className="product-field-error">
                        {errors.precioMinorista}
                      </small>
                    )}
                  </div>
                  {/* Precio mayorista */}
                  <div className="product-form-group">
                    <label htmlFor="product-wholesale-price">
                      Precio mayorista
                    </label>

                    <input
                      id="product-wholesale-price"
                      name="precioMayorista"
                      type="number"
                      value={formData.precioMayorista}
                      onChange={handleChange}
                      min="0"
                      max="999999999.99"
                      step="0.01"
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E"].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder="Opcional"
                      disabled={isViewMode || isLoading || isLoadingProduct}
                    />

                    {errors.precioMayorista && (
                      <small className="product-field-error">
                        {errors.precioMayorista}
                      </small>
                    )}
                  </div>
                  {/* Cantidad mínima mayorista */}
                  <div className="product-form-group">
                    <label htmlFor="product-wholesale-min">
                      Cantidad mínima mayorista
                    </label>

                    <input
                      id="product-wholesale-min"
                      name="cantidadMinMayorista"
                      value={formData.cantidadMinMayorista}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      step="1"
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E", "."].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder="Opcional"
                      disabled={isViewMode || isLoading || isLoadingProduct}
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

        {/* Botones inferiores: solo aparecen cuando se puede guardar */}
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
              disabled={isLoading || isLoadingProduct}
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
