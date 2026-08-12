<?php
require_once 'config.php';
requireAuth();

$id = $_GET['id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $id) {
    $stmt = $pdo->prepare("SELECT authorId, title, status FROM Requests WHERE _id = ?");
    $stmt->execute([$id]);
    $request = $stmt->fetch();
    if (!$request) {
        http_response_code(404);
        echo json_encode(['error' => 'Request not found']);
        exit;
    }

    if ($request['authorId'] !== $_SESSION['user_id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Only the requester can send thanks']);
        exit;
    }
    if ($request['status'] !== 'referred') {
        http_response_code(400);
        echo json_encode(['error' => 'Request has not been referred yet']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT _id FROM Thanks WHERE requestId = ?");
    $stmt->execute([$id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Already thanked']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT r.description, u._id as referrerId, u.name as referrerName 
        FROM Referrals r 
        JOIN Users u ON r.referrerId = u._id 
        WHERE r.requestId = ?
    ");
    $stmt->execute([$id]);
    $referral = $stmt->fetch();
    if (!$referral) {
        http_response_code(400);
        echo json_encode(['error' => 'No referral found']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT name FROM Users WHERE _id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $me = $stmt->fetch();

    $letter = "Dear {$referral['referrerName']},\n\nThank you so much for referring me to the role related to \"{$request['title']}\". I really appreciate the time you took to write: \"{$referral['description']}\".\n\nBest regards,\n{$me['name']}";

    $thanksId = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("INSERT INTO Thanks (_id, requestId, fromId, toId, letter, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([$thanksId, $id, $_SESSION['user_id'], $referral['referrerId'], $letter]);

    $pdo->prepare("UPDATE Requests SET status = 'thanked', updatedAt = NOW() WHERE _id = ?")->execute([$id]);

    $msg = "{$me['name']} sent you a thank-you for your referral on \"{$request['title']}\"";
    $nid = bin2hex(random_bytes(16));
    $pdo->prepare("INSERT INTO Notifications (_id, userId, type, message, relatedRequestId, createdAt, updatedAt) VALUES (?, ?, 'thanked', ?, ?, NOW(), NOW())")
        ->execute([$nid, $referral['referrerId'], $msg, $id]);

    http_response_code(201);
    echo json_encode(['thanks' => ['_id' => $thanksId], 'letter' => $letter]);
    exit;
}
?>
