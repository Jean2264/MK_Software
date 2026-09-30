import { useRef, useState, useEffect } from "react";
import * as productService from "../../services/product.service.js";

import "./ProductModal.css";

function ProductModal({
  isOpen,
  onClose,
  mode = "create",
  handleProductCreated,
}) {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState("idle");

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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

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

  if (!isOpen) {
    return null;
  }

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
            Intentar nuevamente
          </button>
        </div>
      );
    }

    return null;
  };

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
          {isSuccess || isError ? (
            renderResult()
          ) : (
            <form
              id="product-form"
              className="product-modal-form"
              onSubmit={handleSubmit}
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
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
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
                    disabled={isViewMode || isLoading}
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-barcode">Código de barras</label>

                  <input
                    id="product-barcode"
                    type="text"
                    placeholder="Código de barras"
                    disabled={isViewMode || isLoading}
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-category">Categoría</label>

                  <select
                    id="product-category"
                    disabled={isViewMode || isLoading}
                  >
                    <option value="">Seleccionar categoría</option>
                  </select>
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-subcategory">Subcategoría</label>

                  <select
                    id="product-subcategory"
                    disabled={isViewMode || isLoading}
                  >
                    <option value="">Seleccionar subcategoría</option>
                  </select>
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-retail-price">Precio minorista</label>

                  <input
                    id="product-retail-price"
                    type="number"
                    placeholder="0,00"
                    disabled={isViewMode || isLoading}
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-wholesale-price">
                    Precio mayorista
                  </label>

                  <input
                    id="product-wholesale-price"
                    type="number"
                    placeholder="Opcional"
                    disabled={isViewMode || isLoading}
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-wholesale-min">
                    Cantidad mínima mayorista
                  </label>

                  <input
                    id="product-wholesale-min"
                    type="number"
                    placeholder="Opcional"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </form>
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
