<?php
require_once 'config.php';
requireAuth();

$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'referring') {
    $stmt = $pdo->prepare("
        SELECT c.*, r.title, r.status, u.name as author_name, u.email as author_email 
        FROM Connections c
        JOIN Requests r ON c.requestId = r._id
        JOIN Users u ON r.authorId = u._id
        WHERE c.referrerId = ?
        ORDER BY c.createdAt DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $connections = $stmt->fetchAll();

    $result = array_map(function($c) {
        return [
            '_id' => $c['_id'],
            'createdAt' => $c['createdAt'],
            'request' => [
                '_id' => $c['requestId'],
                'title' => $c['title'],
                'status' => $c['status'],
                'author' => ['name' => $c['author_name'], 'email' => $c['author_email']]
            ]
        ];
    }, $connections);

    echo json_encode(['connections' => $result]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $id) {
    // Connect to a request
    $stmt = $pdo->prepare("SELECT authorId, title, status FROM Requests WHERE _id = ?");
    $stmt->execute([$id]);
    $request = $stmt->fetch();

    if (!$request) {
        http_response_code(404);
        echo json_encode(['error' => 'Request not found']);
        exit;
    }
    if ($request['authorId'] === $_SESSION['user_id']) {
        http_response_code(400);
        echo json_encode(['error' => 'You cannot connect to your own request']);
        exit;
    }
    if ($request['status'] !== 'open') {
        http_response_code(400);
        echo json_encode(['error' => 'Request is no longer open']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT _id FROM Connections WHERE requestId = ? AND referrerId = ?");
    $stmt->execute([$id, $_SESSION['user_id']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Already connected']);
        exit;
    }

    $connId = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("INSERT INTO Connections (_id, requestId, referrerId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())");
    $stmt->execute([$connId, $id, $_SESSION['user_id']]);

    $pdo->prepare("UPDATE Requests SET status = 'connected', updatedAt = NOW() WHERE _id = ?")->execute([$id]);

    $stmt = $pdo->prepare("SELECT name FROM Users WHERE _id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $me = $stmt->fetch();

    $msg = "{$me['name']} offered to refer you for \"{$request['title']}\"";
    $nid = bin2hex(random_bytes(16));
    $pdo->prepare("INSERT INTO Notifications (_id, userId, type, message, relatedRequestId, createdAt, updatedAt) VALUES (?, ?, 'connected', ?, ?, NOW(), NOW())")
        ->execute([$nid, $request['authorId'], $msg, $id]);

    http_response_code(201);
    echo json_encode(['connection' => ['_id' => $connId]]);
    exit;
}
?>
