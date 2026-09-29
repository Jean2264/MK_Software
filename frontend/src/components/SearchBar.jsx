import "./SearchBar.css";

function SearchBar({ value, onChange, placeholder = "Buscar...", onSearch }) {
  return (
    <div className="search-bar">
      <input
        className="search-bar-input"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

      <button
        className="search-bar-button"
        type="button"
        onClick={onSearch}
        aria-label="Buscar"
      >
        <i className="bi bi-search"></i>
      </button>
    </div>
  );
}

export default SearchBar;
