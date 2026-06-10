<?php
// backend/endpoints/productos.php

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

// Manejar únicamente peticiones GET para listar productos
if ($method === 'GET') {
    try {
        // Consultar todos los productos disponibles en la tienda
        $query = "SELECT id, nombre, descripcion, precio, stock, categoria, imagen_url FROM productos ORDER BY id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $productos = $stmt->fetchAll();

        // Responder con éxito devolviendo el arreglo de productos
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $productos
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener los productos: " . $e->getMessage()
        ]);
    }
} else {
    // Si intentan hacer un POST, PUT o DELETE a esta ruta pública, respondemos que no está permitido
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Método no permitido para este endpoint"
    ]);
}