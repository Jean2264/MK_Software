import pool from "../config/database.js";

async function createSubcategory(subcategory) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertQuery = `
        INSERT INTO subcategoria (
            nombre,
            id_categoria
        )
        VALUES ($1, $2)
        RETURNING *;
        `;
    const result = await client.query(insertQuery, [
      subcategory.nombre,
      subcategory.id_categoria,
    ]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getAllSubcategories({ page = 1, limit = 10, search = "" }) {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];

  // ==============================
  // BÚSQUEDA
  // ==============================

  if (search.trim() !== "") {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        s.nombre ILIKE $${values.length}
        OR c.nombre ILIKE $${values.length}
      )
    `);
  }

  // ==============================
  // WHERE
  // ==============================

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // ==============================
  // CONTAR TOTAL
  // ==============================

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM subcategoria s
    INNER JOIN categoria c
      ON c.id_categoria = s.id_categoria
    ${whereClause};
  `;

  const countResult = await pool.query(countQuery, values);

  const totalItems = Number(countResult.rows[0].total);

  // ==============================
  // OBTENER SUBCATEGORÍAS
  // ==============================

  const dataValues = [...values, limit, offset];

  const dataQuery = `
    SELECT
      s.id_subcategoria,
      s.nombre,
      s.id_categoria,
      c.nombre AS nombre_categoria
    FROM subcategoria s
    INNER JOIN categoria c
      ON c.id_categoria = s.id_categoria
    ${whereClause}
    ORDER BY s.id_subcategoria DESC
    LIMIT $${dataValues.length - 1}
    OFFSET $${dataValues.length};
  `;

  const result = await pool.query(dataQuery, dataValues);

  // ==============================
  // PAGINACIÓN
  // ==============================

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: result.rows,

    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
}

export { createSubcategory, getAllSubcategories };
