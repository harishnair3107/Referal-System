<?php
require_once 'config.php';
requireAuth();

$id = $_GET['id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $id) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $description = $input['description'] ?? '';

    if (!$description) {
        http_response_code(400);
        echo json_encode(['error' => 'description required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT authorId, title FROM Requests WHERE _id = ?");
    $stmt->execute([$id]);
    $request = $stmt->fetch();
    if (!$request) {
        http_response_code(404);
        echo json_encode(['error' => 'Request not found']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT _id FROM Connections WHERE requestId = ? AND referrerId = ?");
    $stmt->execute([$id, $_SESSION['user_id']]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'You have not connected to this request']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT _id FROM Referrals WHERE requestId = ? AND referrerId = ?");
    $stmt->execute([$id, $_SESSION['user_id']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'You already submitted a referral for this request']);
        exit;
    }

    $refId = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("INSERT INTO Referrals (_id, requestId, referrerId, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([$refId, $id, $_SESSION['user_id'], $description]);

    $pdo->prepare("UPDATE Requests SET status = 'referred', updatedAt = NOW() WHERE _id = ?")->execute([$id]);

    $stmt = $pdo->prepare("SELECT name FROM Users WHERE _id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $me = $stmt->fetch();

    $msg = "{$me['name']} submitted a referral for your request \"{$request['title']}\"";
    $nid = bin2hex(random_bytes(16));
    $pdo->prepare("INSERT INTO Notifications (_id, userId, type, message, relatedRequestId, createdAt, updatedAt) VALUES (?, ?, 'referred', ?, ?, NOW(), NOW())")
        ->execute([$nid, $request['authorId'], $msg, $id]);

    http_response_code(201);
    echo json_encode(['referral' => ['_id' => $refId]]);
    exit;
}
?>
