# Producto

────────────────────────
idProducto
codigoProducto
codigoBarras
imagen
nombre

costo
precioMinorista

margen_minorista
precioMayorista

margen_mayorista

cantidadMinMayorista
fechaAlta
estado
idSubcategoria

idMarcas

# Stock

────────────────────────
idStock
cantidad
idProducto
fecha

# Subcategoria

────────────────────────
idSubcategoria
codigoSubcategoria
nombre
estado
idCategoria

# Categoria

────────────────────────
idCategoria
codigoCategoria
nombre
estado

# Marca

────────────────────────
IdMarca
nombre
estado

# Movimiento Stock

────────────────────────
idMovimientoStok
idStock
tipoMovimiento
motivo
cantidad
stockAnterior
stockPosterior
fechaMovimiento

# Movimiento general

────────────────────────
idMovimiento
operacion
detalle
