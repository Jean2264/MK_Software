import "./Pagination.css";

function Pagination({ page, totalPages, onPageChange }) {
  const getPages = () => {
    // Si hay pocas páginas, mostramos todas.
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    // Estamos al principio.
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    // Estamos cerca del final.
    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    // Estamos en el medio.
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pages = getPages();

  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        className="pagination-arrow"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      {pages.map((item, index) => {
        if (item === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="pagination-dots"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={item}
            type="button"
            className={`pagination-page ${page === item ? "active" : ""}`}
            onClick={() => onPageChange(item)}
            aria-current={page === item ? "page" : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        className="pagination-arrow"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Página siguiente"
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </nav>
  );
}

export default Pagination;
