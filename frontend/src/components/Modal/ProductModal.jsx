import { useCallback, useEffect, useRef, useState } from "react";

import * as productService from "../../services/product.service.js";
import * as categoryService from "../../services/category.service.js";
import * as subcategoryService from "../../services/subcategory.service.js";

import Combobox from "../Combobox.jsx";
import "./ProductModal.css";

// ======================================================
// VALIDACIONES
// ======================================================

// Valida códigos comerciales GTIN de 8, 12, 13 o 14 dígitos.
function isValidBarcode(value = "") {
  const barcode = String(value).trim();

  if (!/^\d+$/.test(barcode)) return false;

  const validLengths = [8, 12, 13, 14];

  if (!validLengths.includes(barcode.length)) return false;

  const digits = barcode.split("").map(Number);
  const checkDigit = digits.pop();

  const sum = digits.reverse().reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 3 : 1);
  }, 0);

  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === expectedCheckDigit;
}

// Convierte un valor a número y comprueba que sea finito.
function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return NaN;
  }

  return Number(value);
}

// Calcula el precio aplicando margen sobre el precio de venta.
// Ejemplo: costo 800, margen 20 % => precio 1000.
function calculatePrice(cost, margin) {
  const numericCost = toNumber(cost);
  const numericMargin = toNumber(margin);

  if (
    !Number.isFinite(numericCost) ||
    !Number.isFinite(numericMargin) ||
    numericCost <= 0 ||
    numericMargin <= 0 ||
    numericMargin >= 100
  ) {
    return "";
  }

  return (numericCost / (1 - numericMargin / 100)).toFixed(2);
}

// ======================================================
// ESTADO INICIAL DEL FORMULARIO
// ======================================================

const INITIAL_FORM_DATA = {
  nombre: "",
  codigoBarras: "",
  costo: "",
  margenMinorista: "",
  precioMinorista: "",
  margenMayorista: "",
  precioMayorista: "",
  cantidadMinMayorista: "",
  cantidad: "0",
};

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
  // ESTADOS GENERALES
  // ------------------------------------------------------

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const [productCode, setProductCode] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // ------------------------------------------------------
  // ESTADOS DE IMAGEN
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

  const categoryRequestRef = useRef(0);
  const subcategoryRequestRef = useRef(0);

  const selectedCategoryOptionRef = useRef(null);
  const selectedSubcategoryOptionRef = useRef(null);

  // ------------------------------------------------------
  // CONSTANTES Y ESTADOS DERIVADOS
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

  const isDisabled = isViewMode || isLoading || isLoadingProduct;

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  // ======================================================
  // CARGA DE CATEGORÍAS
  // ======================================================

  const loadCategories = useCallback(async (page = 1, search = "") => {
    const requestId = ++categoryRequestRef.current;

    setCategoryLoading(true);

    try {
      const response = await categoryService.getCategories(page, 10, search);

      if (requestId !== categoryRequestRef.current) return;

      const newOptions = response.data ?? [];

      setCategoryOptions((previous) => {
        if (page === 1) {
          const selectedOption = selectedCategoryOptionRef.current;

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

        const existingIds = new Set(
          previous.map((item) => String(item.id_categoria)),
        );

        return [
          ...previous,
          ...newOptions.filter(
            (item) => !existingIds.has(String(item.id_categoria)),
          ),
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
  }, []);

  // ======================================================
  // CARGA DE SUBCATEGORÍAS
  // ======================================================

  const loadSubcategories = useCallback(
    async (selectedCategoryId, page = 1, search = "") => {
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
          if (page === 1) {
            const selectedOption = selectedSubcategoryOptionRef.current;

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

          const existingIds = new Set(
            previous.map((item) => String(item.id_subcategoria)),
          );

          return [
            ...previous,
            ...newOptions.filter(
              (item) => !existingIds.has(String(item.id_subcategoria)),
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
    },
    [],
  );

  // ======================================================
  // CARGA DEL PRODUCTO PARA EDICIÓN O INSPECCIÓN
  // ======================================================

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    setIsLoadingProduct(true);
    setServerError("");

    try {
      const product = await productService.getProductById(productId);

      setProductCode(product.codigo_producto ?? "");

      setFormData({
        nombre: product.nombre ?? "",
        codigoBarras: product.codigo_barras ?? "",
        costo: product.costo ?? "",
        margenMinorista: product.margen_minorista ?? "",
        precioMinorista: product.precio_minorista ?? "",
        margenMayorista: product.margen_mayorista ?? "",
        precioMayorista: product.precio_mayorista ?? "",
        cantidadMinMayorista: product.cantidad_min_mayorista ?? "",
        cantidad: String(product.cantidad ?? 0),
      });

      const selectedCategoryId = String(product.id_categoria ?? "");
      const selectedSubcategoryId = String(product.id_subcategoria ?? "");

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

      if (selectedCategoryId) {
        setCategoryOptions((previous) => {
          const exists = previous.some(
            (item) => String(item.id_categoria) === selectedCategoryId,
          );

          return exists
            ? previous
            : [
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
          const exists = previous.some(
            (item) => String(item.id_subcategoria) === selectedSubcategoryId,
          );

          return exists
            ? previous
            : [
                {
                  id_subcategoria: product.id_subcategoria,
                  nombre: product.nombre_subcategoria ?? "",
                },
                ...previous,
              ];
        });
      }

      setImage(
        product.imagen
          ? product.imagen.startsWith("http")
            ? product.imagen
            : `http://localhost:3000${product.imagen}`
          : null,
      );
    } catch (error) {
      console.error("Error al cargar el producto:", error);
      setServerError("No se pudo cargar el producto.");
    } finally {
      setIsLoadingProduct(false);
    }
  }, [productId]);

  // ======================================================
  // EFECTOS DE INICIALIZACIÓN Y LIMPIEZA
  // ======================================================

  useEffect(() => {
    if (!isOpen) return;

    loadCategories(1, "");
  }, [isOpen, loadCategories]);

  useEffect(() => {
    if (!isOpen || (mode !== "edit" && mode !== "view") || !productId) {
      return;
    }

    loadProduct();
  }, [isOpen, mode, productId, loadProduct]);

  useEffect(() => {
    subcategoryRequestRef.current++;

    setSubcategoryOptions([]);
    setSubcategoryPage(1);
    setSubcategoryHasMore(false);
    setSubcategoryId("");
    selectedSubcategoryOptionRef.current = null;

    if (!categoryId || !isOpen) return;

    loadSubcategories(categoryId, 1, "");
  }, [categoryId, isOpen, loadSubcategories]);

  useEffect(() => {
    if (status !== "success") return;

    const timeout = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [status, onClose]);

  useEffect(() => {
    if (isOpen) return;

    categoryRequestRef.current++;
    subcategoryRequestRef.current++;

    setErrors({});
    setServerError("");
    setStatus("idle");
    setProductCode("");
    setFormData(INITIAL_FORM_DATA);

    setImage(null);
    setImageFile(null);

    setCategoryId("");
    setSubcategoryId("");
    setCategoryOptions([]);
    setSubcategoryOptions([]);

    setCategoryPage(1);
    setSubcategoryPage(1);
    setCategoryHasMore(false);
    setSubcategoryHasMore(false);

    selectedCategoryOptionRef.current = null;
    selectedSubcategoryOptionRef.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen]);

  // ======================================================
  // MANEJADORES DE CATEGORÍAS
  // ======================================================

  const handleCategoryChange = (selectedId) => {
    const normalizedId = String(selectedId);

    selectedCategoryOptionRef.current =
      categoryOptions.find(
        (item) => String(item.id_categoria) === normalizedId,
      ) ?? null;

    selectedSubcategoryOptionRef.current = null;

    subcategoryRequestRef.current++;

    setCategoryId(normalizedId);
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

  // ======================================================
  // MANEJADORES DE CAMPOS Y CÁLCULO DE PRECIOS
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      // Recalcula el precio minorista cuando cambia el costo o el margen.
      if (name === "costo" || name === "margenMinorista") {
        updated.precioMinorista = calculatePrice(
          updated.costo,
          updated.margenMinorista,
        );
      }

      // Recalcula el precio mayorista con su margen independiente.
      if (name === "costo" || name === "margenMayorista") {
        updated.precioMayorista = calculatePrice(
          updated.costo,
          updated.margenMayorista,
        );
      }

      return updated;
    });

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ======================================================
  // MANEJO DE IMÁGENES
  // ======================================================

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
    if (isDisabled) return;

    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (isDisabled) return;

    setImage(null);
    setImageFile(null);

    setErrors((previous) => ({
      ...previous,
      imagen: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================================
  // VALIDACIÓN DEL FORMULARIO
  // ======================================================

  const validateForm = () => {
    const newErrors = {};

    const name = formData.nombre.trim();
    const barcode = formData.codigoBarras.trim();

    const cost = toNumber(formData.costo);
    const retailMargin = toNumber(formData.margenMinorista);
    const wholesaleMargin = toNumber(formData.margenMayorista);

    const wholesaleMin = formData.cantidadMinMayorista;
    const quantity = toNumber(formData.cantidad);

    if (!name) {
      newErrors.nombre = "El nombre del producto es obligatorio.";
    }

    if (!isValidBarcode(barcode)) {
      newErrors.codigoBarras =
        "Ingresá un código válido de 8, 12, 13 o 14 dígitos.";
    }

    if (!categoryId) {
      newErrors.categoria = "Seleccioná una categoría.";
    }

    if (!subcategoryId) {
      newErrors.subcategoria = "Seleccioná una subcategoría.";
    }

    if (!Number.isFinite(cost) || cost <= 0) {
      newErrors.costo = "El costo debe ser mayor que cero.";
    }

    if (
      !Number.isFinite(retailMargin) ||
      retailMargin <= 0 ||
      retailMargin >= 100
    ) {
      newErrors.margenMinorista =
        "El margen minorista debe ser mayor que 0 y menor que 100.";
    }

    if (
      !Number.isFinite(wholesaleMargin) ||
      wholesaleMargin <= 0 ||
      wholesaleMargin >= 100
    ) {
      newErrors.margenMayorista =
        "El margen mayorista debe ser mayor que 0 y menor que 100.";
    }

    if (wholesaleMin !== "") {
      const value = Number(wholesaleMin);

      if (!Number.isInteger(value) || value < 1) {
        newErrors.cantidadMinMayorista =
          "La cantidad mínima mayorista debe ser un entero mayor que cero.";
      }
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      newErrors.cantidad =
        "La cantidad debe ser un número entero igual o mayor que cero.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ======================================================
  // ENVÍO DEL FORMULARIO
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading || isLoadingProduct || isViewMode) return;

    setServerError("");

    if (!validateForm()) return;

    setStatus("loading");

    const payload = new FormData();

    payload.append("nombre", formData.nombre.trim());
    payload.append("codigoBarras", formData.codigoBarras.trim());
    payload.append("idSubcategoria", subcategoryId);
    payload.append("costo", String(formData.costo));
    payload.append("margenMinorista", String(formData.margenMinorista));
    payload.append("precioMinorista", String(formData.precioMinorista));
    payload.append("margenMayorista", String(formData.margenMayorista));
    payload.append("precioMayorista", String(formData.precioMayorista));
    payload.append(
      "cantidadMinMayorista",
      String(formData.cantidadMinMayorista),
    );

    // La cantidad inicial se envía solo si el backend implementa ese campo.
    payload.append("cantidad", String(formData.cantidad));

    if (imageFile) {
      payload.append("imagen", imageFile);
    }

    try {
      // Este servicio actualmente corresponde al flujo de alta.
      // La edición requiere un método específico del servicio/backend.
      if (mode !== "create") {
        throw new Error(
          "La edición necesita conectarse al endpoint de actualización.",
        );
      }

      await productService.createProduct(payload);

      if (typeof handleProductCreated === "function") {
        await handleProductCreated();
      }

      setStatus("success");
    } catch (error) {
      console.error("Error al guardar el producto:", error);

      setServerError(
        error?.message ||
          "Ocurrió un error al guardar el producto. Intentá nuevamente.",
      );

      setStatus("error");
    }
  };

  // ======================================================
  // MENSAJES DE RESULTADO
  // ======================================================

  const renderResult = () => {
    if (isSuccess) {
      return (
        <div className="product-modal-result product-modal-result-success">
          <div className="product-result-icon">
            <i className="bi bi-check-lg" aria-hidden="true" />
          </div>

          <h2>Producto guardado correctamente</h2>
          <p>El producto fue agregado al catálogo.</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div
          className="product-modal-result product-modal-result-error"
          role="alert"
        >
          <div className="product-result-icon">
            <i className="bi bi-exclamation-lg" aria-hidden="true" />
          </div>

          <div className="error-info">
            <h2>No se pudo guardar el producto</h2>
            <p>
              {serverError ||
                "Ocurrió un error al guardar el producto. Intentá nuevamente."}
            </p>

            <button
              type="button"
              className="product-modal-save"
              onClick={() => setStatus("idle")}
            >
              Volver al formulario
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ======================================================
  // RENDERIZADO DEL MODAL
  // ======================================================

  if (!isOpen) return null;

  return (
    <div className="product-modal-overlay">
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* ENCABEZADO */}
        <header className="product-header">
          <h2 id="product-modal-title">{titles[mode] ?? titles.create}</h2>

          <button
            type="button"
            className="product-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={isLoading}
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        {/* CONTENIDO */}
        <div className="product-modal-content">
          {isSuccess ? (
            renderResult()
          ) : (
            <>
              {isError && renderResult()}

              {isLoadingProduct ? (
                <div className="product-modal-loading" role="status">
                  Cargando información del producto...
                </div>
              ) : (
                <form
                  id="product-form"
                  className="product-modal-form"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {/* ======================================
                      IMAGEN DEL PRODUCTO
                  ====================================== */}
                  <section className="modal-section product-image-section">
                    <div className="product-modal-image-container">
                      {image ? (
                        <div className="product-image-preview-container">
                          <div className="product-image-preview">
                            <img
                              src={image}
                              alt={`Imagen de ${formData.nombre || "producto"}`}
                            />

                            {!isViewMode && (
                              <button
                                type="button"
                                className="product-image-remove"
                                onClick={handleRemoveImage}
                                aria-label="Eliminar imagen"
                                disabled={isDisabled}
                              >
                                <i className="bi bi-x" aria-hidden="true" />
                              </button>
                            )}
                          </div>

                          {!isViewMode && (
                            <button
                              type="button"
                              className="product-image-button"
                              onClick={handleSelectImage}
                              disabled={isDisabled}
                            >
                              <i className="bi bi-pencil" aria-hidden="true" />
                              Editar imagen
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="product-modal-image-placeholder">
                          <i className="bi bi-image" aria-hidden="true" />
                          <span>Imagen del producto</span>

                          {!isViewMode && (
                            <button
                              type="button"
                              className="product-image-button"
                              onClick={handleSelectImage}
                              disabled={isDisabled}
                            >
                              <i className="bi bi-plus-lg" aria-hidden="true" />
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
                        disabled={isDisabled}
                      />
                    </div>
                  </section>

                  {/* ======================================
                      INFORMACIÓN DEL PRODUCTO
                  ====================================== */}
                  <section className="modal-section">
                    <h2 className="modal-section-title">
                      Información del producto
                    </h2>

                    <div className="section-content product-info-grid">
                      {/* CÓDIGO AUTOMÁTICO */}
                      <div className="product-form-group">
                        <label htmlFor="product-code">Código de producto</label>

                        <input
                          id="product-code"
                          type="text"
                          value={productCode}
                          placeholder="Se generará automáticamente"
                          disabled
                        />
                      </div>

                      {/* NOMBRE */}
                      <div className="product-form-group">
                        <label htmlFor="product-name">Nombre</label>

                        <input
                          id="product-name"
                          name="nombre"
                          type="text"
                          value={formData.nombre}
                          onChange={handleChange}
                          placeholder="Nombre del producto"
                          maxLength={120}
                          required
                          disabled={isDisabled}
                          aria-invalid={Boolean(errors.nombre)}
                          aria-describedby={
                            errors.nombre ? "product-name-error" : undefined
                          }
                        />

                        {errors.nombre && (
                          <small
                            id="product-name-error"
                            className="product-field-error"
                          >
                            {errors.nombre}
                          </small>
                        )}
                      </div>

                      {/* CÓDIGO DE BARRAS */}
                      <div className="product-form-group">
                        <label htmlFor="product-barcode">
                          Código de barras
                        </label>

                        <input
                          id="product-barcode"
                          name="codigoBarras"
                          type="text"
                          inputMode="numeric"
                          value={formData.codigoBarras}
                          onChange={handleChange}
                          placeholder="Código de barras"
                          maxLength={14}
                          required
                          disabled={isDisabled}
                          aria-invalid={Boolean(errors.codigoBarras)}
                          aria-describedby={
                            errors.codigoBarras
                              ? "product-barcode-error"
                              : undefined
                          }
                        />

                        {errors.codigoBarras && (
                          <small
                            id="product-barcode-error"
                            className="product-field-error"
                          >
                            {errors.codigoBarras}
                          </small>
                        )}
                      </div>

                      {/* MARCA */}
                      <div className="product-form-group">
                        <label htmlFor="product-brand">Marca</label>

                        <select
                          id="product-brand"
                          name="idMarca"
                          value={formData.idMarca ?? ""}
                          onChange={handleChange}
                          disabled
                        >
                          <option value="">
                            La selección de marcas se integrará después
                          </option>
                        </select>
                      </div>

                      {/* CATEGORÍA */}
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
                          onLoadMore={() =>
                            loadCategories(categoryPage + 1, "")
                          }
                          loading={categoryLoading}
                          hasMore={categoryHasMore}
                          disabled={isDisabled}
                        />

                        {errors.categoria && (
                          <small className="product-field-error">
                            {errors.categoria}
                          </small>
                        )}
                      </div>

                      {/* SUBCATEGORÍA */}
                      <div className="product-form-group">
                        <label htmlFor="product-subcategory">
                          Subcategoría
                        </label>

                        <Combobox
                          options={subcategoryOptions}
                          value={subcategoryId}
                          onChange={(selectedId) => {
                            const normalizedId = String(selectedId);

                            selectedSubcategoryOptionRef.current =
                              subcategoryOptions.find(
                                (item) =>
                                  String(item.id_subcategoria) === normalizedId,
                              ) ?? null;

                            setSubcategoryId(normalizedId);
                          }}
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
                            loadSubcategories(
                              categoryId,
                              subcategoryPage + 1,
                              "",
                            )
                          }
                          loading={subcategoryLoading}
                          hasMore={subcategoryHasMore}
                          disabled={isDisabled || !categoryId}
                        />

                        {errors.subcategoria && (
                          <small className="product-field-error">
                            {errors.subcategoria}
                          </small>
                        )}
                      </div>

                      {/* CANTIDAD INICIAL */}
                      <div className="product-form-group">
                        <label htmlFor="product-quantity">Cantidad</label>

                        <input
                          id="product-quantity"
                          name="cantidad"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.cantidad}
                          onChange={handleChange}
                          placeholder="Cantidad inicial"
                          disabled={isDisabled}
                          aria-invalid={Boolean(errors.cantidad)}
                        />

                        {errors.cantidad && (
                          <small className="product-field-error">
                            {errors.cantidad}
                          </small>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* ======================================
                      PRECIOS Y GANANCIAS
                  ====================================== */}
                  <section className="modal-section">
                    <h2 className="modal-section-title">Precios y ganancias</h2>

                    <div className="section-content pricing-content">
                      {/* ---------- PRECIO MINORISTA ---------- */}
                      <div className="price-subsection">
                        <h3 className="price-subsection-title">
                          Precio minorista
                        </h3>

                        <div className="price-fields">
                          <div className="product-form-group">
                            <label htmlFor="product-cost">Costo unitario</label>

                            <input
                              id="product-cost"
                              name="costo"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={formData.costo}
                              onChange={handleChange}
                              placeholder="0,00"
                              required
                              disabled={isDisabled}
                              aria-invalid={Boolean(errors.costo)}
                            />

                            {errors.costo && (
                              <small className="product-field-error">
                                {errors.costo}
                              </small>
                            )}
                          </div>

                          <div className="product-form-group">
                            <label htmlFor="product-margin-retail">
                              Margen minorista (%)
                            </label>

                            <input
                              id="product-margin-retail"
                              name="margenMinorista"
                              type="number"
                              min="0.01"
                              max="99.99"
                              step="0.01"
                              value={formData.margenMinorista}
                              onChange={handleChange}
                              placeholder="Ej. 30"
                              required
                              disabled={isDisabled}
                              aria-invalid={Boolean(errors.margenMinorista)}
                            />

                            {errors.margenMinorista && (
                              <small className="product-field-error">
                                {errors.margenMinorista}
                              </small>
                            )}
                          </div>

                          <div className="product-form-group">
                            <label htmlFor="product-retail-price">
                              Precio minorista calculado
                            </label>

                            <input
                              id="product-retail-price"
                              name="precioMinorista"
                              type="number"
                              value={formData.precioMinorista}
                              placeholder="Se calcula automáticamente"
                              readOnly
                              disabled={isViewMode}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ---------- PRECIO MAYORISTA ---------- */}
                      <div className="price-subsection">
                        <h3 className="price-subsection-title">
                          Precio mayorista
                        </h3>

                        <div className="price-fields">
                          <div className="product-form-group">
                            <label htmlFor="product-margin-wholesale">
                              Margen mayorista (%)
                            </label>

                            <input
                              id="product-margin-wholesale"
                              name="margenMayorista"
                              type="number"
                              min="0.01"
                              max="99.99"
                              step="0.01"
                              value={formData.margenMayorista}
                              onChange={handleChange}
                              placeholder="Ej. 20"
                              required
                              disabled={isDisabled}
                              aria-invalid={Boolean(errors.margenMayorista)}
                            />

                            {errors.margenMayorista && (
                              <small className="product-field-error">
                                {errors.margenMayorista}
                              </small>
                            )}
                          </div>

                          <div className="product-form-group">
                            <label htmlFor="product-wholesale-min">
                              Cantidad mínima mayorista
                            </label>

                            <input
                              id="product-wholesale-min"
                              name="cantidadMinMayorista"
                              type="number"
                              min="1"
                              step="1"
                              value={formData.cantidadMinMayorista}
                              onChange={handleChange}
                              placeholder="Ej. 6"
                              disabled={isDisabled}
                              aria-invalid={Boolean(
                                errors.cantidadMinMayorista,
                              )}
                            />

                            {errors.cantidadMinMayorista && (
                              <small className="product-field-error">
                                {errors.cantidadMinMayorista}
                              </small>
                            )}
                          </div>

                          <div className="product-form-group">
                            <label htmlFor="product-wholesale-price">
                              Precio mayorista calculado
                            </label>

                            <input
                              id="product-wholesale-price"
                              name="precioMayorista"
                              type="number"
                              value={formData.precioMayorista}
                              placeholder="Se calcula automáticamente"
                              readOnly
                              disabled={isViewMode}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </form>
              )}
            </>
          )}
        </div>

        {/* BOTONES DE ACCIÓN */}
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
                  <span className="saving-dots" aria-hidden="true">
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
