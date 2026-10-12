CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

alter table categoria
add column estado boolean default true
select * from categoria
alter table categoria
add column estado boolean default TRUE

UPDATE categoria
set estado= true

CREATE TABLE subcategoria (
    id_subcategoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
	estado boolean default TRUE,
    id_categoria INTEGER NOT NULL
);

alter table subcategoria
add constraint fk_subcategoria_categoria
foreign key (id_categoria) references categoria(id_categoria)

SELECT *
FROM subcategoria
WHERE id_categoria = 4;



CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    codigo_producto VARCHAR(20) UNIQUE,
    codigo_barras VARCHAR(50),
    nombre VARCHAR(150) NOT NULL,
	imagen TEXT,
    precio_minorista NUMERIC(10,2) NOT NULL,
    precio_mayorista NUMERIC(10,2),
    cantidad_min_mayorista INTEGER,
    fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE,
    id_subcategoria INTEGER
);

ALTER TABLE producto
ADD COLUMN imagen TEXT;

ALTER TABLE producto
ADD CONSTRAINT fk_producto_subcategoria
FOREIGN KEY (id_subcategoria)
REFERENCES subcategoria(id_subcategoria);


select * from producto
delete from producto where codigo_producto= 'PRO00014'

update producto 
set estado=True

SELECT
    p.id_producto,
    p.id_subcategoria AS id_subcategoria_producto,
    s.id_subcategoria AS id_subcategoria_encontrada,
    s.nombre AS nombre_subcategoria,
    s.id_categoria AS id_categoria_de_subcategoria,
    c.id_categoria AS id_categoria_encontrada,
    c.nombre AS nombre_categoria
FROM producto p
LEFT JOIN subcategoria s
    ON p.id_subcategoria = s.id_subcategoria
LEFT JOIN categoria c
    ON s.id_categoria = c.id_categoria
WHERE p.id_producto = 15;