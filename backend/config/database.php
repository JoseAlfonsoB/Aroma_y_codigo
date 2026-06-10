<?php
// backend/config/database.php

class Database {
    private static $host = "localhost";
    private static $db_name = "aroma_codigo_db";
    private static $username = "developer"; // Ajusta según tus credenciales de MySQL locales
    private static $password = "AromaCodigo2026*";     // Ajusta según tus credenciales de MySQL locales
    private static $conn = null;

    public static function getConnection() {
        if (self::$conn !== null) {
            return self::$conn;
        }

        try {
            $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$db_name . ";charset=utf8mb4";
            
            // Configurar opciones de PDO para máxima seguridad y manejo de errores
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            self::$conn = new PDO($dsn, self::$username, self::$password, $options);
        } catch (PDOException $exception) {
            // Enviamos un error en formato JSON por si el frontend intenta consumir y la BD está caída
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Error de conexión a la base de datos: " . $exception->getMessage()
            ]);
            exit;
        }

        return self::$conn;
    }
}