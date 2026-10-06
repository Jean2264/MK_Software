import pool from "../config/database.js";

async function createCategory(category) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO categoria (
        nombre
      )
      VALUES ($1)
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [category.nombre]);

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateCategory(id, category) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateQuery = `
    UPDATE categoria
    SET nombre= $1
    WHERE id_categoria = $2
    RETURNING *;
    `;

    const result = await client.query(updateQuery, [category.nombre, id]);

    if (result.rowCount === 0) {
      throw new Error("Categoria no encontrada");
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteCategory(id) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deleteQuery = `
    UPDATE categoria
    SET estado= FALSE
    WHERE id_categoria = $1
    RETURNING *;
    `;

    const result = await client.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      throw new Error("Categoria no encontrada");
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getAllCategories({ page = 1, limit = 10, search = "" }) {
  const offset = (page - 1) * limit;

  const conditions = ["estado= TRUE"];
  const values = [];

  /*
   * ==============================
   * BÚSQUEDA
   * ==============================
   */

  if (search.trim() !== "") {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      nombre ILIKE $${values.length}
    `);
  }

  /*
   * ==============================
   * WHERE
   * ==============================
   */

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  /*
   * ==============================
   * CONTAR REGISTROS
   * ==============================
   */

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM categoria
    ${whereClause};
  `;

  const countResult = await pool.query(countQuery, values);

  const totalItems = Number(countResult.rows[0].total);

  /*
   * ==============================
   * OBTENER CATEGORÍAS
   * ==============================
   */

  const dataValues = [...values, limit, offset];

  const dataQuery = `
    SELECT
      id_categoria,
      nombre
    FROM categoria
    ${whereClause}
    ORDER BY id_categoria DESC
    LIMIT $${dataValues.length - 1}
    OFFSET $${dataValues.length};
  `;

  const result = await pool.query(dataQuery, dataValues);

  /*
   * ==============================
   * PAGINACIÓN
   * ==============================
   */

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

export { createCategory, getAllCategories, updateCategory, deleteCategory };
