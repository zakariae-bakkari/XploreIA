<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use Core\EmailService;
use PDO;


class AuthController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function signup() {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'All fields are required'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid email format'], 400);
        }

        // Check if email exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Email already registered'], 400);
        }

        // Generate 6-digit code
        $code = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        // Store in session
        $_SESSION['pending_user'] = [
            'name' => $name,
            'email' => $email,
            'password_hash' => $passwordHash,
            'code' => $code,
            'expires_at' => time() + (15 * 60) // 15 minutes
        ];

        // Send email
        EmailService::sendVerificationCode($email, $code);

        $this->jsonResponse([
            'status' => 'success', 
            'message' => 'Verification code sent to email',
            'expires_at' => $_SESSION['pending_user']['expires_at']
        ]);
    }

    public function verifyCode() {
        $input = json_decode(file_get_contents('php://input'), true);
        $code = $input['code'] ?? '';

        if (!isset($_SESSION['pending_user'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'No pending signup found'], 400);
        }

        $pending = $_SESSION['pending_user'];

        if (time() > $pending['expires_at']) {
            unset($_SESSION['pending_user']);
            $this->jsonResponse(['status' => 'error', 'message' => 'Verification code expired'], 400);
        }

        if ($code !== $pending['code']) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Incorrect verification code'], 400);
        }

        try {
            // Insert user
            $stmt = $this->db->prepare("
                INSERT INTO users (email, password_hash, name, status, role) 
                VALUES (:email, :password_hash, :name, 'active', 'user')
            ");
            
            $stmt->execute([
                'email' => $pending['email'],
                'password_hash' => $pending['password_hash'],
                'name' => $pending['name']
            ]);

            $userId = $this->db->lastInsertId();
            
            // If lastInsertId is 0 because of UUID trigger/default, we might need to fetch it
            if (!$userId) {
                $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email");
                $stmt->execute(['email' => $pending['email']]);
                $user = $stmt->fetch();
                $userId = $user['id'];
            }

            // Create session
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $pending['name'];
            
            unset($_SESSION['pending_user']);

            $this->jsonResponse([
                'status' => 'success',
                'message' => 'Account created and logged in',
                'user' => [
                    'id' => $userId,
                    'name' => $pending['name'],
                    'email' => $pending['email']
                ]
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
