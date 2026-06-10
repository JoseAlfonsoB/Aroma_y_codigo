<?php
// backend/endpoints/pagos.php

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $usuario_id     = isset($input['usuario_id']) ? intval($input['usuario_id']) : 0;
    $total          = isset($input['total']) ? floatval($input['total']) : 0.00;
    $id_transaccion = isset($input['id_transaccion']) ? trim($input['id_transaccion']) : 'SIM-'.time(); // ID simulado o real de la pasarela
    $items          = isset($input['items']) ? $input['items'] : []; // Arreglo de productos [{producto_id, cantidad, precio}]

    if ($usuario_id === 0 || $total <= 0 || empty($items)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Información de orden incompleta."]);
        exit();
    }

    try {
        // INICIAMOS UNA TRANSACCIÓN ATÓMICA DE SQL
        $db->beginTransaction();

        // 1. Insertar la cabecera del pedido
        $pedidoQuery = "INSERT INTO pedidos (usuario_id, total, estado_pago, id_transaccion) 
                        VALUES (:usuario_id, :total, 'completado', :id_transaccion)";
        $pedidoStmt = $db->prepare($pedidoQuery);
        $pedidoStmt->execute([
            ':usuario_id'     => $usuario_id,
            ':total'          => $total,
            ':id_transaccion' => $id_transaccion
        ]);
        
        // Obtenemos el ID del pedido que se acaba de generar automáticamente
        $pedido_id = $db->lastInsertId();

        // Preparar las consultas para el ciclo de inserción y reducción de stock
        $detalleQuery = "INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) 
                         VALUES (:pedido_id, :producto_id, :cantidad, :precio_unitario)";
        $detalleStmt = $db->prepare($detalleQuery);

        $stockQuery = "UPDATE productos SET stock = stock - :cantidad WHERE id = :producto_id";
        $stockStmt = $db->prepare($stockQuery);

        // 2. Iterar sobre cada producto del pedido
        foreach ($items as $item) {
            $p_id   = intval($item['producto_id']);
            $cant   = intval($item['cantidad']);
            $precio = floatval($item['precio']);

            // Insertar el renglón del detalle de compra
            $detalleStmt->execute([
                ':pedido_id'       => $pedido_id,
                ':producto_id'     => $p_id,
                ':cantidad'        => $cant,
                ':precio_unitario' => $precio
            ]);

            // Descontar la cantidad del stock actual del producto
            $stockStmt->execute([
                ':cantidad'    => $cant,
                ':producto_id' => $p_id
            ]);
        }

        // 3. Limpiar automáticamente el carrito de compras del usuario, ya que los productos han sido adquiridos
        $clearCartQuery = "DELETE FROM carrito WHERE usuario_id = :usuario_id";
        $clearCartStmt = $db->prepare($clearCartQuery);
        $clearCartStmt->execute([':usuario_id' => $usuario_id]);

        // CONFIRMAR TODO EN LA BASE DE DATOS SI NO HUBO ERRORES
        $db->commit();

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Pedido procesado y pagado con éxito.",
            "pedido_id" => $pedido_id
        ]);

    } catch (Exception $e) {
        // Si algo falla catastróficamente, revertimos los cambios para no dejar datos corruptos o stock inconsistente
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Error crítico al procesar la compra: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
}