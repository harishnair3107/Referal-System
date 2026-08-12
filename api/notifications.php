<?php
require_once 'config.php';
requireAuth();

$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM Notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50");
    $stmt->execute([$_SESSION['user_id']]);
    $notifications = $stmt->fetchAll();
    
    // cast read to bool
    $notifications = array_map(function($n) {
        $n['read'] = (bool)$n['read'];
        return $n;
    }, $notifications);

    echo json_encode(['notifications' => $notifications]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
    if ($action === 'read-all') {
        $stmt = $pdo->prepare("UPDATE Notifications SET `read` = 1, updatedAt = NOW() WHERE userId = ? AND `read` = 0");
        $stmt->execute([$_SESSION['user_id']]);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($id && $action === 'read') {
        $stmt = $pdo->prepare("UPDATE Notifications SET `read` = 1, updatedAt = NOW() WHERE _id = ? AND userId = ?");
        $stmt->execute([$id, $_SESSION['user_id']]);
        echo json_encode(['ok' => true]);
        exit;
    }
}
?>
