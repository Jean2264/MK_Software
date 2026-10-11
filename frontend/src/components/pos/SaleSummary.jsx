import { useEffect, useRef, useState } from "react";
import ProductImage from "./ProductImage";
import "./SaleSummary.css";

const paymentMethods = [
  { value: "efectivo", label: "Efectivo", icon: "bi-cash" },
  { value: "qr", label: "QR", icon: "bi-qr-code" },
  {
    value: "transferencia",
    label: "Transferencia",
    icon: "bi-bank",
  },
  {
    value: "debito",
    label: "Tarjeta de débito",
    icon: "bi-credit-card",
  },
  {
    value: "credito",
    label: "Tarjeta de crédito",
    icon: "bi-credit-card-2-front",
  },
];

function formatPrice(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });
}

function SaleSummary({
  product = null,
  subtotal = 0,
  discount = 0,
  onCancelSale,
  onFinishSale,
}) {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  const total = Math.max(0, Number(subtotal) - Number(discount));

  const imageSrc = product?.imagen
    ? product.imagen.startsWith("http")
      ? product.imagen
      : `http://localhost:3000${product.imagen}`
    : null;

  function selectMethod(method) {
    setSelectedMethod(method);
    setIsOpen(false);
    setActiveIndex(
      paymentMethods.findIndex((item) => item.value === method.value),
    );
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      optionRefs.current[activeIndex]?.focus();
    }
  }, [isOpen, activeIndex]);

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        setActiveIndex(
          paymentMethods.findIndex(
            (item) => item.value === selectedMethod.value,
          ),
        );
        setIsOpen(true);
        return;
      }

      setActiveIndex((current) => (current + 1) % paymentMethods.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        setActiveIndex(
          paymentMethods.findIndex(
            (item) => item.value === selectedMethod.value,
          ),
        );
        setIsOpen(true);
        return;
      }

      setActiveIndex(
        (current) =>
          (current - 1 + paymentMethods.length) % paymentMethods.length,
      );
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        setActiveIndex(
          paymentMethods.findIndex(
            (item) => item.value === selectedMethod.value,
          ),
        );
        setIsOpen(true);
        return;
      }

      selectMethod(paymentMethods[activeIndex]);
    }

    if (event.key === "Escape" || event.key === "Tab") {
      setIsOpen(false);
    }
  }

  return (
    <section className="sale-summary">
      <header className="sale-summary-header">
        <h2>Resumen de venta</h2>
      </header>

      {/* Método de pago */}
      <section className="sale-summary-payment">
        <label id="payment-method-label">Método de pago</label>

        <div
          className="sale-summary-payment-select"
          ref={dropdownRef}
          onKeyDown={handleKeyDown}
        >
          <button
            type="button"
            className="sale-summary-payment-trigger"
            aria-labelledby="payment-method-label"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => {
              if (!isOpen) {
                setActiveIndex(
                  paymentMethods.findIndex(
                    (item) => item.value === selectedMethod.value,
                  ),
                );
              }

              setIsOpen((current) => !current);
            }}
          >
            <i className={`bi ${selectedMethod.icon}`} aria-hidden="true" />

            <span>{selectedMethod.label}</span>

            <i
              className={`bi ${
                isOpen ? "bi-chevron-up" : "bi-chevron-down"
              } sale-summary-payment-chevron`}
              aria-hidden="true"
            />
          </button>

          {isOpen && (
            <ul
              className="sale-summary-payment-options"
              role="listbox"
              aria-labelledby="payment-method-label"
            >
              {paymentMethods.map((method, index) => (
                <li key={method.value} role="presentation">
                  <button
                    type="button"
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    role="option"
                    aria-selected={selectedMethod.value === method.value}
                    tabIndex={activeIndex === index ? 0 : -1}
                    className={`sale-summary-payment-option ${
                      selectedMethod.value === method.value ? "is-selected" : ""
                    }`}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => selectMethod(method)}
                  >
                    <i className={`bi ${method.icon}`} aria-hidden="true" />

                    <span>{method.label}</span>

                    {selectedMethod.value === method.value && (
                      <i
                        className="bi bi-check2 sale-summary-payment-check"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Producto seleccionado */}
      <section className="sale-summary-product">
        <h3 className="sale-summary-section-title">Producto seleccionado</h3>

        {product ? (
          <div className="sale-summary-product-content">
            <div className="sale-summary-product-image">
              <ProductImage src={imageSrc} alt={product.nombre} />
            </div>

            <div className="sale-summary-product-info">
              <h4>{product.nombre}</h4>

              <p>Precio minorista: {formatPrice(product.precio_minorista)}</p>

              {product.precio_mayorista != null &&
                product.cantidad_min_mayorista != null && (
                  <>
                    <p className="sale-summary-wholesale-price">
                      Precio mayorista: {formatPrice(product.precio_mayorista)}{" "}
                      c/u
                    </p>

                    <small>
                      A partir de {product.cantidad_min_mayorista} unidades
                    </small>
                  </>
                )}
            </div>
          </div>
        ) : (
          <div className="sale-summary-product-empty">
            <ProductImage src={null} alt="" />
            <p>Seleccioná un producto para ver su información.</p>
          </div>
        )}
      </section>

      {/* Importes de la venta */}
      <section className="sale-summary-totals">
        <h3 className="sale-summary-section-title">Detalle de importes</h3>

        <div className="sale-summary-total-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="sale-summary-total-row">
          <span>Descuento</span>
          <span>{formatPrice(discount)}</span>
        </div>

        <div className="sale-summary-total-final">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </section>

      {/* Acciones */}
      <footer className="sale-summary-actions">
        <button
          type="button"
          className="sale-summary-finish"
          onClick={onFinishSale}
        >
          <i className="bi bi-check2-circle" aria-hidden="true" />
          Finalizar venta
        </button>
      </footer>
    </section>
  );
}

export default SaleSummary;
