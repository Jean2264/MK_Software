import "./DataTable.css";

function DataTable({ columns, data, rowKey }) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessor}>{column.header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table-empty">
                No hay registros.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item[rowKey]}>
                {columns.map((column) => (
                  <td key={column.accessor}>
                    {column.render
                      ? column.render(item)
                      : item[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
