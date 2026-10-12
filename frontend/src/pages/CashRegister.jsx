import { useState } from "react";
import SaleItemsTable from "../components/pos/SaleItemsTable";
import SaleSummary from "../components/pos/SaleSummary";
import "./CashRegister.css";
import GlobalSearch from "../components/pos/GlobalSearch";

function CashRegister() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discount, setDiscount] = useState(0);

  //calculo el subtotal de todas las filas

  const subtotal = products.reduce(
    (accumulator, product) => accumulator + product.price * product.quantity,
    0,
  );

  const total = Math.max(0, subtotal - discount);

  function handleProductScanned(product) {
    setSelectedProduct(product);
  }

  function handleCancelSale() {
    setProducts([]);
    setSelectedProduct(null);
  }

  function handleFinishSale() {
    if (products.length === 0) {
      alert("Agregá al menos un producto antes de finalizar.");
      return;
    }

    alert(
      "El total de la venta es " +
        subtotal.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        }) +
        ". Todavía falta implementar el registro de la venta.",
    );
  }
  return (
    <main className="cash-register">
      <header className="cash-register-header">
        <GlobalSearch />
      </header>
      <section className="cash-register-content">
        <SaleItemsTable
          products={products}
          setProducts={setProducts}
          onProductScanned={handleProductScanned}
          discount={discount}
          setDiscount={setDiscount}
          total={total}
          onCancelSale={handleCancelSale}
        />
        <SaleSummary
          product={selectedProduct}
          subtotal={subtotal}
          discount={discount}
          onCancelSale={handleCancelSale}
          onFinishSale={handleFinishSale}
        />
      </section>
    </main>
  );
}

export default CashRegister;
