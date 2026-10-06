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
delete from producto where nombre= 'MATE COCIDO MAROLIO 25 UN'