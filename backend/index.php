<?php
// API GATEWAY

// backend/index.php

// 1. CONFIGURACIÓN DE CABECERAS HTTP (Esencial para solucionar CORS)
header("Access-Control-Allow-Origin: *"); // En producción se cambia por la URL de tu despliegue HTTPS
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Si la petición es de tipo OPTIONS (preflight de CORS), respondemos con un 200 limpio y terminamos
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. DETECTAR LA RUTA SOLICITADA
// Analiza lo que viene en la URL, por ejemplo: /backend/index.php/productos o /backend/productos
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($requestUri, '/'));

// Buscamos cuál es el endpoint que quiere el cliente
// Dependiendo de cómo levantes tu servidor PHP local, el segmento puede variar, 
// así que buscamos la palabra clave en los segmentos de la URL.
$endpoint = '';
if (in_array('auth', $uriSegments)) $endpoint = 'auth';
if (in_array('productos', $uriSegments)) $endpoint = 'productos';
if (in_array('carrito', $uriSegments)) $endpoint = 'carrito';
if (in_array('pagos', $uriSegments)) $endpoint = 'pagos';

// 3. ENRUTADOR CENTRAL (Estructura limpia basada en archivos individuales)
switch ($endpoint) {
    case 'auth':
        require_once __DIR__ . '/endpoints/auth.php';
        break;

    case 'productos':
        require_once __DIR__ . '/endpoints/productos.php';
        break;

    case 'carrito':
        require_once __DIR__ . '/endpoints/carrito.php';
        break;

    case 'pagos':
        require_once __DIR__ . '/endpoints/pagos.php';
        break;

    default:
        // Si no coincide con ningún endpoint válido, mandamos un error 404 estructurado
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Endpoint no encontrado. Ruta solicitada: " . $requestUri
        ]);
        break;
}