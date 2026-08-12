<?php
// api/config.php

session_start();

$host = 'localhost';
$db   = 'referal_db';
$user = 'root';
$pass = 'chickenfry31';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Set JSON header for all API responses
header('Content-Type: application/json');

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }
}

function requireAdmin() {
    requireAuth();
    if (empty($_SESSION['is_admin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin only']);
        exit;
    }
}
?>
