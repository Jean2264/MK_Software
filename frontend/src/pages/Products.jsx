import { useState, useEffect } from "react";
import * as productService from "../services/product.service.js";

import SearchBar from "../components/SearchBar";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import ProductModal from "../components/Modal/ProductModal";
import CategoryModal from "../components/Modal/CategoryModal.jsx";
import ConfirmModal from "../components/Modal/ConfirmModal.jsx";

import "./Products.css";

function Products() {
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [modeModal, setModeModal] = useState("create");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  //funcion para buscar producto
  const handleSeach = () => {
    setPage(1);
    setSearchTerm(search.trim());
  };

  //funciones para abrir y cerrar modal categorias
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  const handleAddProduct = () => {
    setModeModal("create");
    setIsProductModalOpen(true);
  };

  const handleSeeProduct = (productId) => {
    setSelectedProductId(productId);
    setModeModal("view");
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (productId) => {
    setSelectedProductId(productId);
    setModeModal("edit");
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts(page, searchTerm);

      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, searchTerm]);

  const handleProductCreated = async () => {
    await loadProducts();
  };

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
      render: (product) => (
        <div className="product-actions">
          <button
            type="button"
            className="product-action-button"
            aria-label="Inspeccionar producto"
            onClick={() => handleSeeProduct(product.id_producto)}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            type="button"
            className="product-action-button"
            onClick={() => handleEditProduct(product.id_producto)}
            aria-label="Editar producto"
          >
            <i className="bi bi-pencil"></i>
          </button>

          <button
            type="button"
            className="product-action-button product-action-danger"
            onClick={() => handleDeleteProduct(product)}
            aria-label="Eliminar producto"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productService.deleteProduct(selectedProduct.id_producto);

      setIsConfirmModalOpen(false);
      setSelectedProduct(null);

      await loadProducts();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setSelectedProduct(null);
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
          onSearch={handleSeach}
        />

        <button
          type="button"
          className="products-category-button"
          onClick={handleOpenCategoryModal}
        >
          <i className="bi bi-tags"></i>
          Categorías
        </button>
      </div>

      <DataTable columns={columns} data={products} rowKey="id_producto" />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        handleProductCreated={handleProductCreated}
        mode={modeModal}
        productId={selectedProductId}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="¿Eliminar producto?"
        message={`¿Estás seguro de que querés eliminar "${selectedProduct?.nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  );
}

export default Products;
