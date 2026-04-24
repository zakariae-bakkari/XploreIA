<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

class UserController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Fetch all users from the database
     */
    public function index() {
        try {
            $stmt = $this->db->query("SELECT id, email, name, profile_url, status, role, last_login_at, created_at FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll();
            
            $this->jsonResponse([
                'status' => 'success',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}