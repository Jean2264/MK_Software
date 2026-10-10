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
  disabled = false,

  selectedOptionFallback = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const onSearchRef = useRef(onSearch);
  const previousSearchRef = useRef("");
  const loadMoreLockRef = useRef(false);
  const optionsContainerRef = useRef(null);

  // Mantiene actualizada la función de búsqueda sin reiniciar el debounce.
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Busca la opción seleccionada en la lista actual.
  // Si no está disponible por la paginación, utiliza la opción de respaldo.
  const selectedOption =
    options.find(
      (option) => String(getOptionValue(option)) === String(value),
    ) ??
    (selectedOptionFallback &&
    String(getOptionValue(selectedOptionFallback)) === String(value)
      ? selectedOptionFallback
      : null);

  /*
   * BÚSQUEDA CON DEBOUNCE
   *
   * Ejecuta la búsqueda 300 ms después de que el usuario
   * deja de escribir, evitando solicitudes innecesarias.
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
   * LIBERAR EL BLOQUEO DE PAGINACIÓN
   *
   * Permite solicitar otra página cuando termina la carga actual.
   */
  useEffect(() => {
    if (!loading) {
      loadMoreLockRef.current = false;
    }
  }, [loading]);

  /*
   * SELECCIÓN
   *
   * Notifica al componente padre el identificador seleccionado.
   */
  const handleSelect = (option) => {
    onChange?.(getOptionValue(option));

    setIsOpen(false);
    setSearch("");
    previousSearchRef.current = "";
  };

  /*
   * SCROLL INFINITO
   *
   * Solicita la siguiente página al llegar al final de la lista,
   * siempre que existan más resultados y no haya otra carga activa.
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
   *
   * Limpia la búsqueda al cerrar y evita abrir el componente
   * cuando está deshabilitado.
   */
  const handleToggle = () => {
    if (disabled) {
      return;
    }

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
        disabled={disabled}
      >
        <span>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>

        <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} />
      </button>

      {isOpen && !disabled && (
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
