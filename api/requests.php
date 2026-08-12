<?php
require_once 'config.php';
requireAuth();

$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'mine') {
        $stmt = $pdo->prepare("
            SELECT r.*, u.name as author_name, u.email as author_email 
            FROM Requests r 
            JOIN Users u ON r.authorId = u._id 
            WHERE r.authorId = ? 
            ORDER BY r.createdAt DESC
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $requests = $stmt->fetchAll();
        
        $result = array_map(function($req) {
            $req['author'] = ['_id' => $req['authorId'], 'name' => $req['author_name'], 'email' => $req['author_email']];
            return $req;
        }, $requests);

        echo json_encode(['requests' => $result]);
        exit;
    }

    if ($id) {
        $stmt = $pdo->prepare("
            SELECT r.*, u.name as author_name, u.email as author_email 
            FROM Requests r 
            JOIN Users u ON r.authorId = u._id 
            WHERE r._id = ?
        ");
        $stmt->execute([$id]);
        $request = $stmt->fetch();
        if (!$request) {
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            exit;
        }
        $request['author'] = ['_id' => $request['authorId'], 'name' => $request['author_name'], 'email' => $request['author_email']];

        // Comments
        $stmt = $pdo->prepare("
            SELECT c.*, u.name as author_name, u.email as author_email 
            FROM Comments c 
            JOIN Users u ON c.authorId = u._id 
            WHERE c.requestId = ? 
            ORDER BY c.createdAt ASC
        ");
        $stmt->execute([$id]);
        $comments = array_map(function($c) {
            $c['author'] = ['_id' => $c['authorId'], 'name' => $c['author_name'], 'email' => $c['author_email']];
            return $c;
        }, $stmt->fetchAll());

        // Connections
        $stmt = $pdo->prepare("
            SELECT c.*, u.name as referrer_name, u.email as referrer_email 
            FROM Connections c 
            JOIN Users u ON c.referrerId = u._id 
            WHERE c.requestId = ?
        ");
        $stmt->execute([$id]);
        $connections = array_map(function($c) {
            $c['referrer'] = ['_id' => $c['referrerId'], 'name' => $c['referrer_name'], 'email' => $c['referrer_email']];
            return $c;
        }, $stmt->fetchAll());

        // Referral
        $stmt = $pdo->prepare("
            SELECT r.*, u.name as referrer_name, u.email as referrer_email 
            FROM Referrals r 
            JOIN Users u ON r.referrerId = u._id 
            WHERE r.requestId = ?
        ");
        $stmt->execute([$id]);
        $referral = $stmt->fetch();
        if ($referral) {
            $referral['referrer'] = ['_id' => $referral['referrerId'], 'name' => $referral['referrer_name'], 'email' => $referral['referrer_email']];
        }

        // Thanks
        $stmt = $pdo->prepare("SELECT * FROM Thanks WHERE requestId = ?");
        $stmt->execute([$id]);
        $thanks = $stmt->fetch();

        echo json_encode([
            'request' => $request,
            'comments' => $comments,
            'connections' => $connections,
            'referral' => $referral ?: null,
            'thanks' => $thanks ?: null
        ]);
        exit;
    }

    // Default: feed (all open requests)
    $stmt = $pdo->query("
        SELECT r.*, u.name as author_name, u.email as author_email 
        FROM Requests r 
        JOIN Users u ON r.authorId = u._id 
        WHERE r.status != 'closed' 
        ORDER BY r.createdAt DESC
    ");
    $requests = $stmt->fetchAll();
    
    $result = array_map(function($req) {
        $req['author'] = ['_id' => $req['authorId'], 'name' => $req['author_name'], 'email' => $req['author_email']];
        return $req;
    }, $requests);

    echo json_encode(['requests' => $result]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($action === 'comment' && $id) {
        $text = $input['text'] ?? '';
        if (!$text) {
            http_response_code(400);
            echo json_encode(['error' => 'text required']);
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

        $commentId = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO Comments (_id, requestId, authorId, text, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$commentId, $id, $_SESSION['user_id'], $text]);

        // Notify if commenter is not author
        if ($request['authorId'] !== $_SESSION['user_id']) {
            $stmt = $pdo->prepare("SELECT name FROM Users WHERE _id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $me = $stmt->fetch();

            $msg = "{$me['name']} commented on your request \"{$request['title']}\"";
            $nid = bin2hex(random_bytes(16));
            $pdo->prepare("INSERT INTO Notifications (_id, userId, type, message, relatedRequestId, createdAt, updatedAt) VALUES (?, ?, 'comment', ?, ?, NOW(), NOW())")
                ->execute([$nid, $request['authorId'], $msg, $id]);
        }

        echo json_encode(['comment' => ['_id' => $commentId, 'text' => $text, 'createdAt' => date('Y-m-d H:i:s')]]);
        exit;
    }

    // Default: create new request
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    if (!$title || !$description) {
        http_response_code(400);
        echo json_encode(['error' => 'title and description required']);
        exit;
    }

    $reqId = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("INSERT INTO Requests (_id, title, description, authorId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'open', NOW(), NOW())");
    $stmt->execute([$reqId, $title, $description, $_SESSION['user_id']]);

    echo json_encode(['request' => ['_id' => $reqId, 'title' => $title, 'description' => $description, 'status' => 'open']]);
    exit;
}
?>
