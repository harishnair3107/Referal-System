<?php
// api/auth.php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($action === 'register') {
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $inviteCode = $input['inviteCode'] ?? '';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email and password are required']);
            exit;
        }

        $stmt = $pdo->query("SELECT COUNT(*) FROM Users");
        $totalUsers = $stmt->fetchColumn();
        $isAdmin = ($totalUsers == 0) ? 1 : 0;

        if ($totalUsers > 0) {
            if (!$inviteCode) {
                http_response_code(400);
                echo json_encode(['error' => 'An invite code is required']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT _id FROM Invites WHERE code = ? AND usedById IS NULL");
            $stmt->execute([$inviteCode]);
            $invite = $stmt->fetch();

            if (!$invite) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid or already used invite code']);
                exit;
            }
        }

        $stmt = $pdo->prepare("SELECT _id FROM Users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already registered']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $id = bin2hex(random_bytes(16)); // Simple UUID simulation
        
        $stmt = $pdo->prepare("INSERT INTO Users (_id, name, email, password, isAdmin, inviteCode, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$id, $name, $email, $hash, $isAdmin, $inviteCode]);

        if ($totalUsers > 0 && isset($invite)) {
            $stmt = $pdo->prepare("UPDATE Invites SET usedById = ?, usedAt = NOW(), updatedAt = NOW() WHERE _id = ?");
            $stmt->execute([$id, $invite['_id']]);
        }

        $_SESSION['user_id'] = $id;
        $_SESSION['is_admin'] = $isAdmin;

        http_response_code(201);
        echo json_encode(['user' => ['_id' => $id, 'name' => $name, 'email' => $email, 'isAdmin' => (bool)$isAdmin]]);
        exit;
    }

    if ($action === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM Users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit;
        }

        $_SESSION['user_id'] = $user['_id'];
        $_SESSION['is_admin'] = $user['isAdmin'];

        unset($user['password']);
        $user['isAdmin'] = (bool)$user['isAdmin'];
        echo json_encode(['user' => $user]);
        exit;
    }

    if ($action === 'logout') {
        session_destroy();
        echo json_encode(['ok' => true]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'me') {
        requireAuth();
        $stmt = $pdo->prepare("SELECT _id, name, email, isAdmin FROM Users WHERE _id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        $user['isAdmin'] = (bool)$user['isAdmin'];
        echo json_encode(['user' => $user]);
        exit;
    }

    if ($action === 'first-user-check') {
        $stmt = $pdo->query("SELECT COUNT(*) FROM Users");
        $count = $stmt->fetchColumn();
        echo json_encode(['isFirst' => ($count == 0)]);
        exit;
    }
}
?>
