<?php
// backend/endpoints/carrito.php

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

// Nota: En un sistema de producción real, aquí validaríamos un Token JWT enviado desde React.
// Para tu entorno académico local, recibiremos el 'usuario_id' en los parámetros o en el cuerpo.

switch ($method) {
    case 'GET':
        // Obtener los productos del carrito de un usuario específico
        $usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;

        if ($usuario_id === 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID de usuario requerido."]);
            exit();
        }

        try {
            // Hacemos un INNER JOIN para traer los detalles visuales del producto (nombre, precio, imagen)
            $query = "SELECT c.id, c.producto_id, p.nombre, p.precio, p.imagen_url, c.cantidad 
                      FROM carrito c 
                      INNER JOIN productos p ON c.producto_id = p.id 
                      WHERE c.usuario_id = :usuario_id";
            $stmt = $db->prepare($query);
            $stmt->execute([':usuario_id' => $usuario_id]);
            $items = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $items]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al obtener el carrito: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Agregar o actualizar un producto en el carrito
        $input = json_decode(file_get_contents('php://input'), true);
        $usuario_id = isset($input['usuario_id']) ? intval($input['usuario_id']) : 0;
        $producto_id = isset($input['producto_id']) ? intval($input['producto_id']) : 0;
        $cantidad = isset($input['cantidad']) ? intval($input['cantidad']) : 1;

        if ($usuario_id === 0 || $producto_id === 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
            exit();
        }

        try {
            // 1. Verificar si el producto ya está en el carrito de ese usuario
            $checkQuery = "SELECT id, cantidad FROM carrito WHERE usuario_id = :usuario_id AND producto_id = :producto_id LIMIT 1";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([':usuario_id' => $usuario_id, ':producto_id' => $producto_id]);
            $existingItem = $checkStmt->fetch();

            if ($existingItem) {
                // Si ya existe, sumamos la nueva cantidad
                $nuevaCantidad = $existingItem['cantidad'] + $cantidad;
                $updateQuery = "UPDATE carrito SET cantidad = :cantidad WHERE id = :id";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([':cantidad' => $nuevaCantidad, ':id' => $existingItem['id']]);
            } else {
                // Si no existe, lo insertamos desde cero
                $insertQuery = "INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (:usuario_id, :producto_id, :cantidad)";
                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->execute([':usuario_id' => $usuario_id, ':producto_id' => $producto_id, ':cantidad' => $cantidad]);
            }

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Carrito actualizado correctamente."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al procesar el carrito: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Eliminar un elemento específico del carrito o vaciarlo por completo
        $input = json_decode(file_get_contents('php://input'), true);
        $carrito_id = isset($input['carrito_id']) ? intval($input['carrito_id']) : 0;
        $usuario_id = isset($input['usuario_id']) ? intval($input['usuario_id']) : 0; // Para la opción de vaciar todo

        try {
            if ($carrito_id > 0) {
                // Eliminar un solo producto
                $query = "DELETE FROM carrito WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([':id' => $carrito_id]);
            } elseif ($usuario_id > 0) {
                // Vaciar todo el carrito del usuario (útil después de completar una compra)
                $query = "DELETE FROM carrito WHERE usuario_id = :usuario_id";
                $stmt = $db->prepare($query);
                $stmt->execute([':usuario_id' => $usuario_id]);
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Faltan parámetros para eliminar."]);
                exit();
            }

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Elemento(s) eliminado(s) con éxito."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al eliminar: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Método no permitido."]);
        break;
}