<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Core\Database;

$db = Database::getInstance()->getConnection();

try {
    echo "Fixing empty/null status values to 'active'...\n";
    $db->beginTransaction();

    $updated = $db->prepare("UPDATE models SET status = 'active' WHERE status IS NULL OR status = ''");
    $updated->execute();
    $count = $updated->rowCount();

    echo "Rows updated: $count\n";

    // set default at schema level
    echo "Altering column to set DEFAULT 'active'...\n";
    $db->exec("ALTER TABLE models MODIFY status VARCHAR(32) NOT NULL DEFAULT 'active'");

    $db->commit();
    echo "Done.\n";
} catch (\Exception $e) {
    $db->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

return 0;
