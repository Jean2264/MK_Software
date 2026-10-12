import "./GlobalSearch.css";

function GlobalSearch({ placeholder = "Buscar..." }) {
  return (
    <main className="global-search">
      <div className="global-search-container">
        <header className="global-search-header">
          <h1>Buscar</h1>
          <p>Buscá información en el sistema.</p>
        </header>
        <section className="global-search-content">
          <form className="global-search-form">
            <div className="global-search-bar">
              <i className="bi bi-search icono"></i>
              <input
                type="search"
                className="input"
                name="query"
                placeholder={placeholder}
              />
              <button type="submit" className="btn">
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            <button type="button" className="general">
              <i className="bi bi-funnel"></i>
            </button>
          </form>
          <div className="global-search-results"></div>
        </section>
      </div>
    </main>
  );
}

export default GlobalSearch;
