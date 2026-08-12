<?php
require_once 'config.php';
requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT _id, name, email FROM Users");
    $users = $stmt->fetchAll();

    $rankings = [];
    foreach ($users as $u) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Connections WHERE referrerId = ?");
        $stmt->execute([$u['_id']]);
        $connectionsMade = (int)$stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Referrals WHERE referrerId = ?");
        $stmt->execute([$u['_id']]);
        $referralsMade = (int)$stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Thanks WHERE toId = ?");
        $stmt->execute([$u['_id']]);
        $thankYousReceived = (int)$stmt->fetchColumn();

        $score = ($referralsMade * 3) + ($thankYousReceived * 5) + $connectionsMade;

        $rankings[] = [
            '_id' => $u['_id'],
            'name' => $u['name'],
            'email' => $u['email'],
            'referralsMade' => $referralsMade,
            'thankYousReceived' => $thankYousReceived,
            'connectionsMade' => $connectionsMade,
            'score' => $score
        ];
    }

    usort($rankings, function($a, $b) {
        return $b['score'] <=> $a['score'];
    });

    echo json_encode(['rankings' => $rankings]);
    exit;
}
?>
