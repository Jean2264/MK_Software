import { useEffect, useState } from "react";

import "./Combobox.css";

function Combobox({
  options = [],
  value = "",
  onChange,

  placeholder = "Seleccionar...",

  getOptionValue = (option) => option.id,
  getOptionLabel = (option) => option.label,

  onSearch,
  onLoadMore,

  loading = false,
  hasMore = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  /*
   * ==============================
   * OPCIÓN SELECCIONADA
   * ==============================
   */

  const selectedOption = options.find(
    (option) => String(getOptionValue(option)) === String(value),
  );

  /*
   * ==============================
   * BÚSQUEDA
   * ==============================
   */

  useEffect(() => {
    if (!isOpen || !onSearch) {
      return;
    }

    const timeout = setTimeout(() => {
      onSearch(search);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [search, isOpen, onSearch]);

  /*
   * ==============================
   * SELECCIONAR OPCIÓN
   * ==============================
   */

  const handleSelect = (option) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearch("");
  };

  /*
   * ==============================
   * SCROLL / PAGINACIÓN
   * ==============================
   */

  const handleScroll = (event) => {
    const element = event.currentTarget;

    const reachedBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 10;

    if (reachedBottom && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  /*
   * ==============================
   * ABRIR / CERRAR
   * ==============================
   */

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="combobox">
      <button type="button" className="combobox-control" onClick={handleToggle}>
        <span>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>

        <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
      </button>

      {isOpen && (
        <div className="combobox-dropdown">
          <div className="combobox-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar..."
              autoFocus
            />
          </div>

          <div className="combobox-options" onScroll={handleScroll}>
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  type="button"
                  className="combobox-option"
                  key={getOptionValue(option)}
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                </button>
              ))
            ) : !loading ? (
              <div className="combobox-empty">No hay opciones disponibles</div>
            ) : null}

            {loading && <div className="combobox-loading">Cargando...</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Combobox;
