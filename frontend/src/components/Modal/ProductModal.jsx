import { useRef, useState } from "react";

import "./ProductModal.css";

function ProductModal({ isOpen, onClose, mode = "create" }) {
  const [image, setImage] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  const titles = {
    create: "Agregar producto",
    view: "Inspección de producto",
    edit: "Editar producto",
  };

  const isViewMode = mode === "view";

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        <div className="product-modal-content">
          <form className="product-modal-form">
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
                  disabled={isViewMode}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-barcode">Código de barras</label>

                <input
                  id="product-barcode"
                  type="text"
                  placeholder="Código de barras"
                  disabled={isViewMode}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-category">Categoría</label>

                <select id="product-category" disabled={isViewMode}>
                  <option value="">Seleccionar categoría</option>
                </select>
              </div>

              <div className="product-form-group">
                <label htmlFor="product-subcategory">Subcategoría</label>

                <select id="product-subcategory" disabled={isViewMode}>
                  <option value="">Seleccionar subcategoría</option>
                </select>
              </div>

              <div className="product-form-group">
                <label htmlFor="product-retail-price">Precio minorista</label>

                <input
                  id="product-retail-price"
                  type="number"
                  placeholder="0,00"
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
                />
              </div>
            </div>
          </form>
        </div>

        {!isViewMode && (
          <footer className="product-modal-actions">
            <button
              type="button"
              className="product-modal-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button type="button" className="product-modal-save">
              Guardar producto
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

export default ProductModal;
