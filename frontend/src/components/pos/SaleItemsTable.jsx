import { useEffect, useRef, useState } from "react";
import { getProductByBarcode } from "../../services/product.service";
import "./SaleItemsTable.css";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });
}

function getPriceForQuantity(product, quantity) {
  const minimum = Number(product.cantidad_min_mayorista);
  const wholesalePrice = Number(product.precio_mayorista);

  const hasWholesale =
    product.precio_mayorista != null &&
    minimum > 0 &&
    Number.isFinite(wholesalePrice) &&
    wholesalePrice > 0;

  return hasWholesale && quantity >= minimum
    ? wholesalePrice
    : Number(product.precio_minorista);
}

function SaleItemsTable({
  products,
  setProducts,
  onProductScanned,
  discount,
  setDiscount,
  total,
  onCancelSale,
}) {
  const [barcode, setBarcode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeAction, setActiveAction] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountMode, setDiscountMode] = useState("add");
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(null);

  const barcodeInputRef = useRef(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  async function handleBarcodeSubmit(event) {
    event.preventDefault();

    const scannedBarcode = barcode.trim();

    if (!scannedBarcode || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const product = await getProductByBarcode(scannedBarcode);

      if (!product) {
        setMessage("Producto no encontrado.");
        return;
      }

      setProducts((currentProducts) => {
        const existingProduct = currentProducts.find(
          (item) => item.id_producto === product.id_producto,
        );

        if (existingProduct) {
          return currentProducts.map((item) => {
            if (item.id_producto !== product.id_producto) {
              return item;
            }

            const quantity = item.quantity + 1;

            return {
              ...item,
              quantity,
              price: getPriceForQuantity(item, quantity),
            };
          });
        }

        return [
          ...currentProducts,
          {
            ...product,
            quantity: 1,
            price: getPriceForQuantity(product, 1),
          },
        ];
      });

      onProductScanned(product);
      setBarcode("");
    } catch (error) {
      console.error("Error al buscar producto:", error);
      setMessage("No se pudo buscar el producto. Intentá nuevamente.");
    } finally {
      setLoading(false);

      requestAnimationFrame(() => {
        barcodeInputRef.current?.focus();
      });
    }
  }

  function openAction(action) {
    setActiveAction((current) => (current === action ? null : action));
    setChange(null);
    setMessage("");
  }

  function handleEditClick() {
    if (products.length === 0) {
      setMessage("Agregá un producto antes de editar su cantidad.");
      return;
    }

    const selected =
      products.find((product) => product.id_producto === selectedId) ??
      products[products.length - 1];

    setSelectedId(selected.id_producto);
    setEditQuantity(selected.quantity);
    setActiveAction("quantity");
    setMessage("");
  }

  function saveQuantity() {
    const quantity = Number(editQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setMessage("La cantidad debe ser un número entero mayor que cero.");
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id_producto === selectedId
          ? {
              ...product,
              quantity,
              price: getPriceForQuantity(product, quantity),
            }
          : product,
      ),
    );

    setActiveAction(null);
    setMessage("");
  }

  function applyDiscount() {
    const amount = Number(discountAmount);

    if (
      discountAmount.trim() === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setMessage("Ingresá un descuento mayor que cero.");
      return;
    }

    const nextDiscount = discountMode === "add" ? discount + amount : amount;

    if (
      nextDiscount >
      products.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0,
      )
    ) {
      setMessage("El descuento no puede superar el subtotal.");
      return;
    }

    setDiscount(nextDiscount);
    setDiscountAmount("");
    setActiveAction(null);
    setMessage("");
  }

  function calculateChange() {
    if (cashReceived.trim() === "") {
      setMessage("Ingresá cuánto dinero entregó el cliente.");
      return;
    }

    const received = Number(cashReceived);

    if (!Number.isFinite(received) || received < 0) {
      setMessage("Ingresá un importe válido.");
      return;
    }

    if (received < total) {
      setMessage(
        `Faltan ${formatPrice(total - received)} para cubrir el total.`,
      );
      setChange(null);
      return;
    }

    setChange(received - total);
    setMessage("");
  }

  function closeChange() {
    setCashReceived("");
    setChange(null);
    setActiveAction(null);
    setMessage("");
  }

  function handleCancelClick() {
    if (products.length === 0 && discount === 0) {
      setActiveAction(null);
      return;
    }

    const confirmed = window.confirm(
      "¿Querés cancelar la venta actual y quitar todos sus productos?",
    );

    if (!confirmed) return;

    onCancelSale();
    setSelectedId(null);
    setBarcode("");
    setDiscountAmount("");
    setCashReceived("");
    setChange(null);
    setActiveAction(null);
    setMessage("");
  }

  const totalProducts = products.length;

  return (
    <section className="sale-items">
      <header className="sale-items__header">
        <div>
          <h2>Productos de la venta</h2>
          <p>Artículos agregados a la operación</p>
        </div>

        <span className="sale-items__count">{totalProducts} productos</span>
      </header>

      <form className="sale-items__search" onSubmit={handleBarcodeSubmit}>
        <label htmlFor="sale-barcode">
          Agregar producto por código de barras
        </label>

        <div className="sale-items__search-controls">
          <div className="sale-items__input-wrapper">
            <i className="bi bi-upc-scan" aria-hidden="true" />

            <input
              ref={barcodeInputRef}
              id="sale-barcode"
              type="text"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder="Escaneá o ingresá el código de barras"
              autoComplete="off"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="sale-items__submit-button"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Agregar"}
          </button>
        </div>

        <div className="sale-items__search-feedback" aria-live="polite">
          {message}
        </div>
      </form>

      <div className="sale-items__table-wrapper">
        <table className="sale-items__table">
          <thead>
            <tr>
              <th>Código de barras</th>
              <th>Producto</th>
              <th>Precio unitario</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="sale-items__empty">
                  <i className="bi bi-cart3" aria-hidden="true" />
                  <span>Escaneá un código para comenzar la venta.</span>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id_producto}
                  className={
                    selectedId === product.id_producto
                      ? "sale-items__row-selected"
                      : ""
                  }
                  onClick={() => setSelectedId(product.id_producto)}
                >
                  <td>{product.codigo_barras}</td>
                  <td className="sale-items__product-name">{product.nombre}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.quantity}</td>
                  <td className="sale-items__subtotal">
                    {formatPrice(product.price * product.quantity)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="sale-items__actions">
        <div className="sale-items__actions-buttons">
          <button type="button" onClick={handleEditClick}>
            <i className="bi bi-pencil" aria-hidden="true" />
            Editar cantidad
          </button>

          <button type="button" onClick={() => openAction("discount")}>
            <i className="bi bi-percent" aria-hidden="true" />
            Descuento
          </button>

          <button type="button" onClick={() => openAction("change")}>
            <i className="bi bi-cash-stack" aria-hidden="true" />
            Calcular vuelto
          </button>

          <button
            type="button"
            className="sale-items__cancel-action"
            onClick={handleCancelClick}
          >
            <i className="bi bi-x-circle" aria-hidden="true" />
            Cancelar venta
          </button>
        </div>

        {activeAction === "quantity" && (
          <section className="sale-items__action-panel">
            <h3>Editar cantidad</h3>

            <label htmlFor="edit-product">Producto</label>

            <select
              id="edit-product"
              value={selectedId ?? ""}
              onChange={(event) => {
                const id = Number(event.target.value);
                const product = products.find(
                  (item) => item.id_producto === id,
                );

                setSelectedId(id);
                setEditQuantity(product?.quantity ?? 1);
              }}
            >
              {products.map((product) => (
                <option key={product.id_producto} value={product.id_producto}>
                  {product.nombre}
                </option>
              ))}
            </select>

            <label htmlFor="edit-quantity">Cantidad</label>

            <div className="sale-items__quantity-control">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                disabled={editQuantity <= 1}
                onClick={() =>
                  setEditQuantity((current) => Math.max(1, Number(current) - 1))
                }
              >
                −
              </button>

              <input
                id="edit-quantity"
                type="number"
                min="1"
                step="1"
                value={editQuantity}
                onChange={(event) => setEditQuantity(event.target.value)}
              />

              <button
                type="button"
                aria-label="Aumentar cantidad"
                onClick={() =>
                  setEditQuantity((current) => Number(current) + 1)
                }
              >
                +
              </button>
            </div>

            <div className="sale-items__panel-actions">
              <button type="button" onClick={() => setActiveAction(null)}>
                Cancelar
              </button>
              <button type="button" onClick={saveQuantity}>
                Guardar cantidad
              </button>
            </div>
          </section>
        )}

        {activeAction === "discount" && (
          <section className="sale-items__action-panel">
            <h3>Descuento de la venta</h3>

            <p>Descuento actual: {formatPrice(discount)}</p>

            <label htmlFor="discount-mode">Operación</label>

            <select
              id="discount-mode"
              value={discountMode}
              onChange={(event) => setDiscountMode(event.target.value)}
            >
              <option value="add">Agregar al descuento actual</option>
              <option value="replace">Reemplazar descuento</option>
            </select>

            <label htmlFor="discount-amount">Importe en pesos</label>

            <input
              id="discount-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={discountAmount}
              onChange={(event) => setDiscountAmount(event.target.value)}
              placeholder="Ej.: 500"
            />

            <div className="sale-items__panel-actions">
              <button type="button" onClick={() => setActiveAction(null)}>
                Cancelar
              </button>
              <button type="button" onClick={applyDiscount}>
                Aplicar descuento
              </button>
            </div>
          </section>
        )}

        {activeAction === "change" && (
          <section className="sale-items__action-panel">
            <h3>Calcular vuelto</h3>

            <p>Total a cobrar: {formatPrice(total)}</p>

            <label htmlFor="cash-received">Dinero recibido</label>

            <input
              id="cash-received"
              type="number"
              min="0"
              step="0.01"
              value={cashReceived}
              onChange={(event) => {
                setCashReceived(event.target.value);
                setChange(null);
                setMessage("");
              }}
              placeholder="Ej.: 10000"
            />

            {change !== null && (
              <p className="sale-items__change-result">
                Vuelto: <strong>{formatPrice(change)}</strong>
              </p>
            )}

            <div className="sale-items__panel-actions">
              <button type="button" onClick={closeChange}>
                Cerrar
              </button>
              <button type="button" onClick={calculateChange}>
                Calcular
              </button>
            </div>
          </section>
        )}
      </footer>
    </section>
  );
}

export default SaleItemsTable;
