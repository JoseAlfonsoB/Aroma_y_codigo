<?php
// backend/endpoints/auth.php

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

// Solo procesamos solicitudes POST (para envío seguro de credenciales)
if ($method === 'POST') {
    // Leer el cuerpo de la petición JSON enviado desde React
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Detectar qué acción quiere realizar el cliente
    $action = isset($input['accion']) ? $input['accion'] : '';

    // --- ACCIÓN 1: REGISTRO DE NUEVOS USUARIOS ---
    if ($action === 'registro') {
        $nombre = trim($input['nombre'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        // Validación básica de campos vacíos
        if (empty($nombre) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios."]);
            exit();
        }

        try {
            // Verificar primero si el correo ya existe en la base de datos
            $checkQuery = "SELECT id FROM usuarios WHERE email = :email LIMIT 1";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([':email' => $email]);

            if ($checkStmt->fetch()) {
                http_response_code(409); // Conflict
                echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado."]);
                exit();
            }

            // Encriptar la contraseña de manera segura usando el algoritmo nativo de PHP
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);

            // Insertar el nuevo usuario con el rol por defecto 'cliente'
            $insertQuery = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (:nombre, :email, :password, 'cliente')";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->execute([
                ':nombre' => $nombre,
                ':email' => $email,
                ':password' => $passwordHash
            ]);

            http_response_code(201); // Created
            echo json_encode([
                "status" => "success",
                "message" => "Usuario registrado exitosamente."
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
        }
    }

    // --- ACCIÓN 2: INICIO DE SESIÓN (LOGIN) ---
    elseif ($action === 'login') {
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Correo y contraseña requeridos."]);
            exit();
        }

        try {
            // Buscar al usuario por su email
            $query = "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = :email LIMIT 1";
            $stmt = $db->prepare($query);
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();

            // Verificar existencia y validar el hash de la contraseña de forma segura
            if ($user && password_verify($password, $user['password'])) {
                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "message" => "Inicio de sesión correcto.",
                    "user" => [
                        "id" => $user['id'],
                        "nombre" => $user['nombre'],
                        "email" => $user['email'],
                        "rol" => $user['rol']
                    ]
                ]);
            } else {
                http_response_code(401); // Unauthorized
                echo json_encode(["status" => "error", "message" => "Credenciales incorrectas."]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
        }
    }

    // Si mandan un POST pero con una acción inválida
    else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Acción no válida o no especificada."]);
    }

} else {
    // Si intentan usar GET, PUT o DELETE en esta ruta
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método HTTP no permitido."]);
}