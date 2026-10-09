import { useEffect, useRef, useState } from "react";

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

  const onSearchRef = useRef(onSearch);
  const previousSearchRef = useRef("");
  const loadMoreLockRef = useRef(false);
  const optionsContainerRef = useRef(null);

  // Mantener la última función de búsqueda sin reiniciar el debounce
  // cada vez que el componente padre se renderiza.
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const selectedOption = options.find(
    (option) => String(getOptionValue(option)) === String(value),
  );

  /*
   * BÚSQUEDA CON DEBOUNCE
   *
   * La búsqueda se ejecuta al cambiar el texto,
   * no al abrir el Combobox.
   */
  useEffect(() => {
    if (!isOpen || search === previousSearchRef.current) {
      return;
    }

    const timeout = setTimeout(() => {
      previousSearchRef.current = search;
      onSearchRef.current?.(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, isOpen]);

  /*
   * LIBERAR EL BLOQUEO CUANDO TERMINA LA CARGA
   */
  useEffect(() => {
    if (!loading) {
      loadMoreLockRef.current = false;
    }
  }, [loading]);

  /*
   * SELECCIÓN
   */
  const handleSelect = (option) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearch("");
    previousSearchRef.current = "";
  };

  /*
   * SCROLL INFINITO
   */
  const handleScroll = (event) => {
    const element = event.currentTarget;

    const reachedBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 20;

    if (
      reachedBottom &&
      hasMore &&
      !loading &&
      !loadMoreLockRef.current &&
      onLoadMore
    ) {
      loadMoreLockRef.current = true;
      onLoadMore();
    }
  };

  /*
   * ABRIR / CERRAR
   */
  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setSearch("");
      previousSearchRef.current = "";
      return;
    }

    setIsOpen(true);
  };

  return (
    <div className="combobox">
      <button
        type="button"
        className="combobox-control"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>

        <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} />
      </button>

      {isOpen && (
        <div className="combobox-dropdown">
          <div className="combobox-search">
            <i className="bi bi-search" />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Buscar..."
              autoFocus
              aria-label="Buscar opciones"
            />
          </div>

          <div
            ref={optionsContainerRef}
            className="combobox-options"
            onScroll={handleScroll}
          >
            {options.length > 0 &&
              options.map((option) => (
                <button
                  type="button"
                  className="combobox-option"
                  key={getOptionValue(option)}
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                </button>
              ))}

            {options.length === 0 && !loading && (
              <div className="combobox-empty">No hay opciones disponibles</div>
            )}

            {loading && <div className="combobox-loading">Cargando...</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Combobox;
