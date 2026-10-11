import { useState, useEffect } from "react";
import "./SaleItemsTable.css";

const initialProducts = [
  {
    id: 1,
    barcode: "779000001",
    name: "Yerba Mate Tradicional 1 kg",
    price: 3000,
    quantity: 2,
  },
  {
    id: 2,
    barcode: "779000002",
    name: "Azúcar 1 kg",
    price: 1500,
    quantity: 1,
  },
];

function formaTPrice(value) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });
}

function SaleItemsTable() {
  const [products, setProducts] = useState(initialProducts);
  const [barcode, setBarcode] = useState("");
  const [message, setMessage] = useState("");
  return (
    <section className="sale-items">
      <div className="sale-items__header">
        <div>
          <h2>Productos de la venta</h2>
          <p>Artículos agregados a la operación</p>
        </div>

        <span className="sale-items__count">{products.length} productos</span>
      </div>

      <div className="sale-items__table-wrapper">
        <table className="sale-items__table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Precio unitario</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.barcode}</td>
                <td className="sale-items__product-name">{product.name}</td>
                <td>
                  {product.price.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>{product.quantity}</td>
                <td className="sale-items__subtotal">
                  {(product.price * product.quantity).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default SaleItemsTable;
