import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import ProductModal from "../components/Modal/ProductModal";
import "./Products.css";
function Products() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleAddProduct = () => {
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
  };
  const products = [
    {
      id: 1,
      code: "P001",
      name: "Coca-Cola 500ml",
      price: 1200,
      stock: 24,
      category: "Bebidas",
    },
    {
      id: 2,
      code: "P002",
      name: "Alfajor Jorgito",
      price: 800,
      stock: 15,
      category: "Golosinas",
    },
    {
      id: 3,
      code: "P003",
      name: "Papas Lays",
      price: 1800,
      stock: 8,
      category: "Snacks",
    },
  ];

  const columns = [
    {
      header: "Código",
      accessor: "code",
    },
    {
      header: "Producto",
      accessor: "name",
    },
    {
      header: "Precio",
      accessor: "price",
      render: (product) => `$${product.price.toLocaleString("es-AR")}`,
    },
    {
      header: "Stock",
      accessor: "stock",
    },
    {
      header: "Categoría",
      accessor: "category",
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: () => (
        <div className="product-actions">
          <button
            type="button"
            className="product-action-button"
            aria-label="Editar producto"
          >
            <i className="bi bi-pencil"></i>
          </button>

          <button
            type="button"
            className="product-action-button product-action-danger"
            aria-label="Eliminar producto"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const handleSearch = () => {
    console.log("buscar: ", search);
  };

  return (
    <section className="products-page">
      <div className="products-header">
        <div>
          <h1>Productos</h1>
        </div>

        <button
          type="button"
          className="products-add-button"
          onClick={handleAddProduct}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Agregar producto</span>
        </button>
      </div>
      <div className="products-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar productos..."
          onSearch={handleSearch}
        />
      </div>
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        mode="create"
      />
    </section>
  );
}

export default Products;
