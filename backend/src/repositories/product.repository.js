import pool from "../config/database.js";

async function createProduct(product) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //1. creo producto sin codproducto

    const insertQuery = `
        INSERT INTO producto(
        codigo_barras,
        imagen,
        nombre,
        precio_minorista,
        precio_mayorista,
        cantidad_min_mayorista,
        id_subcategoria
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_producto;
        `;

    const insertValues = [
      product.codigoBarras,
      product.imagen,
      product.nombre,
      product.precioMinorista,
      product.precioMayorista,
      product.cantidadMinMayorista,
      product.idSubcategoria,
    ];

    const insertResult = await client.query(insertQuery, insertValues);

    const idproducto = insertResult.rows[0].id_producto;

    //2. genero el codproducto
    const codigoProducto = `PRO${String(idproducto).padStart(5, "0")}`;

    //3.actualizo el producto

    const updateQuery = `
    UPDATE producto
    SET codigo_producto=$1
    WHERE id_producto= $2
    RETURNING *;
    `;

    const updateValues = [codigoProducto, idproducto];

    const updateResult = await client.query(updateQuery, updateValues);

    //4. confirma la transaccion
    await client.query("COMMIT");

    return updateResult.rows[0];
  } catch (error) {
    //si algo falla rollback
    await client.query("ROLLBACK");
    throw error;
  } finally {
    //libero la conexion
    client.release();
  }
}

async function getProducts({
  page = 1,
  limit = 10,
  search = "",
  idCategoria = null,
  idSubcategoria = null,
  estado = true,
  sortBy = "nombre",
  sortOrder = "ASC",
}) {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];

  // Filtro por estado
  if (estado !== null) {
    values.push(estado);
    conditions.push(`p.estado = $${values.length}`);
  }

  // Búsqueda por código, código de barras o nombre
  if (search.trim() !== "") {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        p.codigo_producto ILIKE $${values.length}
        OR p.codigo_barras ILIKE $${values.length}
        OR p.nombre ILIKE $${values.length}
      )
    `);
  }

  // Filtro por categoría
  if (idCategoria !== null) {
    values.push(idCategoria);
    conditions.push(`s.id_categoria = $${values.length}`);
  }

  // Filtro por subcategoría
  if (idSubcategoria !== null) {
    values.push(idSubcategoria);
    conditions.push(`p.id_subcategoria = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Campos permitidos para ordenar
  const allowedSortFields = {
    nombre: "p.nombre",
    codigo: "p.codigo_producto",
    precio: "p.precio_minorista",
    fecha: "p.fecha_alta",
  };

  const orderColumn = allowedSortFields[sortBy] || allowedSortFields.nombre;

  const orderDirection = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

  // Query de datos
  const dataQuery = `
    SELECT
      p.id_producto,
      p.codigo_producto,
      p.codigo_barras,
      p.imagen,
      p.nombre,
      p.precio_minorista,
      p.precio_mayorista,
      p.cantidad_min_mayorista,
      p.fecha_alta,
      p.estado,
      p.id_subcategoria,
      s.nombre AS nombre_subcategoria,
      c.id_categoria,
      c.nombre AS nombre_categoria
    FROM producto p
    LEFT JOIN subcategoria s
      ON p.id_subcategoria = s.id_subcategoria
    LEFT JOIN categoria c
      ON s.id_categoria = c.id_categoria
    ${whereClause}
    ORDER BY ${orderColumn} ${orderDirection}
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2};
  `;

  const dataValues = [...values, limit, offset];

  const dataResult = await pool.query(dataQuery, dataValues);

  // Query para obtener el total
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM producto p
    LEFT JOIN subcategoria s
      ON p.id_subcategoria = s.id_subcategoria
    LEFT JOIN categoria c
      ON s.id_categoria = c.id_categoria
    ${whereClause};
  `;

  const countResult = await pool.query(countQuery, values);

  const total = Number(countResult.rows[0].total);

  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async function getProductById(idProducto) {
  const query = `
    SELECT
      p.id_producto,
      p.codigo_producto,
      p.codigo_barras,
      p.imagen,
      p.nombre,
      p.precio_minorista,
      p.precio_mayorista,
      p.cantidad_min_mayorista,
      p.fecha_alta,
      p.estado,
      p.id_subcategoria,
      s.nombre AS nombre_subcategoria,
      c.id_categoria,
      c.nombre AS nombre_categoria
    FROM producto p
    LEFT JOIN subcategoria s
      ON p.id_subcategoria = s.id_subcategoria
    LEFT JOIN categoria c
      ON s.id_categoria = c.id_categoria
    WHERE p.id_producto = $1;
  `;

  const values = [idProducto];

  const result = await pool.query(query, values);

  return result.rows[0];
}

async function updateProduct(idProducto, product) {
  const query = `
    UPDATE producto
    SET
      codigo_barras = $1,
      imagen = $2,
      nombre = $3,
      precio_minorista = $4,
      precio_mayorista = $5,
      cantidad_min_mayorista = $6,
      id_subcategoria = $7
    WHERE id_producto = $8
    RETURNING *;
  `;

  const values = [
    product.codigoBarras,
    product.imagen,
    product.nombre,
    product.precioMinorista,
    product.precioMayorista,
    product.cantidadMinMayorista,
    product.idSubcategoria,
    idProducto,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}

async function deleteProduct(idProducto) {
  const query = `
    UPDATE producto
    SET estado = false
    WHERE id_producto = $1
    RETURNING *;
  `;

  const values = [idProducto];

  const result = await pool.query(query, values);

  return result.rows[0];
}

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
