<?php
class User {
	public static function create($name, $email) {
		$db = Database::connect();
		$stmt = $db->prepare("INSERT INTO users (name, email) VALUES (?, ?)");
		$stmt->execute([$name, $email]);
	}
	// ...existing code...
}