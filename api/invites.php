<?php
require_once 'config.php';
requireAdmin();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($action === 'members') {
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'name, email, password required']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT _id FROM Users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already registered']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $id = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO Users (_id, name, email, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, NOW(), NOW())");
        $stmt->execute([$id, $name, $email, $hash]);

        http_response_code(201);
        echo json_encode(['user' => ['_id' => $id, 'name' => $name, 'email' => $email]]);
        exit;
    }

    // Default: create invite link
    $code = bin2hex(random_bytes(5)); // 10 chars
    $id = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("INSERT INTO Invites (_id, code, createdById, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())");
    $stmt->execute([$id, $code, $_SESSION['user_id']]);

    http_response_code(201);
    echo json_encode(['invite' => ['_id' => $id, 'code' => $code]]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'members') {
        $stmt = $pdo->query("SELECT _id, name, email, isAdmin, createdAt FROM Users ORDER BY createdAt ASC");
        $users = $stmt->fetchAll();

        foreach ($users as &$u) {
            $u['isAdmin'] = (bool)$u['isAdmin'];
            
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM Connections WHERE referrerId = ?");
            $stmt->execute([$u['_id']]);
            $connections = $stmt->fetchColumn();

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM Referrals WHERE referrerId = ?");
            $stmt->execute([$u['_id']]);
            $referrals = $stmt->fetchColumn();

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM Thanks WHERE toId = ?");
            $stmt->execute([$u['_id']]);
            $thankYous = $stmt->fetchColumn();

            $u['stats'] = ['connections' => (int)$connections, 'referrals' => (int)$referrals, 'thankYous' => (int)$thankYous];
        }

        echo json_encode(['members' => $users]);
        exit;
    }

    // Default: list invites
    $stmt = $pdo->query("
        SELECT i.*, 
               u1.name as createdByName, u1.email as createdByEmail,
               u2.name as usedByName, u2.email as usedByEmail
        FROM Invites i
        LEFT JOIN Users u1 ON i.createdById = u1._id
        LEFT JOIN Users u2 ON i.usedById = u2._id
        ORDER BY i.createdAt DESC
    ");
    $invites = $stmt->fetchAll();

    $result = array_map(function($i) {
        $i['createdBy'] = ['_id' => $i['createdById'], 'name' => $i['createdByName'], 'email' => $i['createdByEmail']];
        if ($i['usedById']) {
            $i['usedBy'] = ['_id' => $i['usedById'], 'name' => $i['usedByName'], 'email' => $i['usedByEmail']];
        } else {
            $i['usedBy'] = null;
        }
        return $i;
    }, $invites);

    echo json_encode(['invites' => $result]);
    exit;
}
?>
