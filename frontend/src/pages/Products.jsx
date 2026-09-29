import { useState, useEffect } from "react";
import * as productService from "../services/product.service.js";

import SearchBar from "../components/SearchBar";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import ProductModal from "../components/Modal/ProductModal";

import "./Products.css";

function Products() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleAddProduct = () => {
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getProducts();

        setProducts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadProducts();
  }, []);

  const columns = [
    {
      header: "Código",
      accessor: "codigo_producto",
    },
    {
      header: "Producto",
      accessor: "nombre",
    },
    {
      header: "Precio",
      accessor: "precio_minorista",
      render: (product) =>
        `$${Number(product.precio_minorista).toLocaleString("es-AR")}`,
    },
    {
      header: "Categoría",
      accessor: "nombre_categoria",
    },
    {
      header: "Subcategoría",
      accessor: "nombre_subcategoria",
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

      <DataTable columns={columns} data={products} rowKey="id_producto" />

      <Pagination page={page} totalPages={1} onPageChange={setPage} />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        mode="create"
      />
    </section>
  );
}

export default Products;
