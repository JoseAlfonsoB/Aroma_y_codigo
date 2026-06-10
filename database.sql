-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS aroma_codigo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aroma_codigo_db;

-- 1. TABLA: USUARIOS (Soporta Clientes y Administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'admin') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TABLA: PRODUCTOS (Catálogo de la tienda)
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255) DEFAULT NULL,
    categoria VARCHAR(50) DEFAULT 'General',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. TABLA: CARRITO (Persistencia temporal de productos seleccionados por el usuario)
CREATE TABLE IF NOT EXISTS carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TABLA: PEDIDOS (Cabecera de la compra / Integración con Pasarela)
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado_pago ENUM('pendiente', 'completado', 'fallido') DEFAULT 'pendiente',
    id_transaccion VARCHAR(255) DEFAULT NULL, -- ID que te regresa Stripe/PayPal
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. TABLA: DETALLES_PEDIDO (Historial exacto de qué compró y a qué precio)
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL, -- Guardamos el precio del momento de la compra
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- INSERCIÓN DE DATOS DE PRUEBA (Para desarrollo local)

-- Clave hash de prueba para password: "password123" (Usando PASSWORD_DEFAULT de PHP)
-- En producción los registraremos mediante el endpoint de auth.php
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Alfonso Admin', 'admin@aromaycodigo.com', '$2y$10$mC36XN763KzX/i3kHnUVE.f8XRElVd6fHj6NlM3H6K7Nl3rZ7O9v.', 'admin'),
('Carlos Cliente', 'carlos@gmail.com', '$2y$10$mC36XN763KzX/i3kHnUVE.f8XRElVd6fHj6NlM3H6K7Nl3rZ7O9v.', 'cliente');

INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url) VALUES
('Café de Especialidad "Espresso Code"', 'Café en grano de origen oaxaqueño con notas de chocolate amargo y almendras. Tueste medio.', 245.00, 50, 'Café', 'cafe_espresso.jpg'),
('Café "Binary Blend" (Molido)', 'Mezcla balanceada ideal para métodos de extracción de filtro. Cuerpo ligero y aroma frutal.', 220.00, 40, 'Café', 'cafe_binary.jpg'),
('Vela Aromática "Vanilla Syntax"', 'Vela artesanal de cera de soya con un profundo y relajante aroma a vainilla pura.', 180.00, 25, 'Esencias', 'vela_vainilla.jpg'),
('Difusor Eléctrico "Aroma Link"', 'Difusor ultrasónico con luz LED programable, ideal para espacios de trabajo.', 450.00, 15, 'Hardware', 'difusor_aroma.jpg');