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
            $_SESSION['user_role'] = 'user'; // Default role for new users
            
            unset($_SESSION['pending_user']);

            $this->jsonResponse([
                'status' => 'success',
                'message' => 'Account created and logged in',
                'user' => [
                    'id' => $userId,
                    'name' => $pending['name'],
                    'email' => $pending['email'],
                    'role' => 'user'
                ]
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    public function login(){
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'All fields are required'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid email format'], 400);
        }

        $stmt = $this->db->prepare("SELECT id, password_hash, name, role FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid credentials'], 404);
        }

        if (!password_verify($password, $user['password_hash'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid credentials'], 401);
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $email;
        $_SESSION['user_role'] = $user['role'] ?? 'user';

        $this->jsonResponse([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $email,
                'role' => $user['role'] ?? 'user'
            ]
        ]);
    }

    public function logout(){
        session_destroy();
        $this->jsonResponse([
            'status' => 'success',
            'message' => 'Logout successful'
        ]);
    }

    public function forgotPassword(){
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';

        if (empty($email)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Email is required'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid email format'], 400);
        }

        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid email'], 404);
        }

        $code = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $_SESSION['forgot_password'] = [
            'user_id' => $user['id'],
            'code' => $code,
            'expires_at' => time() + (15 * 60) // 15 minutes
        ];

        EmailService::sendVerificationCode($email, $code, 'reset');

        $this->jsonResponse([
            'status' => 'success',
            'message' => 'Verification code sent to email',
            'expires_at' => $_SESSION['forgot_password']['expires_at']
        ]);
    }

    public function forgotPasswordVerify(){
        $input = json_decode(file_get_contents('php://input'), true);
        $code = $input['code'] ?? '';

        if (!isset($_SESSION['forgot_password'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'No pending forgot password found'], 400);
        }

        $forgotPassword = $_SESSION['forgot_password'];

        if (time() > $forgotPassword['expires_at']) {
            unset($_SESSION['forgot_password']);
            $this->jsonResponse(['status' => 'error', 'message' => 'Verification code expired'], 400);
        }

        if ($code !== $forgotPassword['code']) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Incorrect verification code'], 400);
        }

        $this->jsonResponse([
            'status' => 'success',
            'message' => 'Verification code verified successfully'
        ]);
    }

    public function resetPassword(){
        $input = json_decode(file_get_contents('php://input'), true);
        $code = $input['code'] ?? '';
        $password = $input['password'] ?? '';
        $confirmPassword = $input['confirm_password'] ?? '';

        if (!isset($_SESSION['forgot_password'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'No pending forgot password found'], 400);
        }

        $forgotPassword = $_SESSION['forgot_password'];

        if (time() > $forgotPassword['expires_at']) {
            unset($_SESSION['forgot_password']);
            $this->jsonResponse(['status' => 'error', 'message' => 'Verification code expired'], 400);
        }

        if ($code !== $forgotPassword['code']) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Incorrect verification code'], 400);
        }

        if (empty($password) || empty($confirmPassword)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'All fields are required'], 400);
        }

        if ($password !== $confirmPassword) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Passwords do not match'], 400);
        }

        if (strlen($password) < 8) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Password must be at least 8 characters'], 400);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare("UPDATE users SET password_hash = :password_hash WHERE id = :user_id");
        $stmt->execute([
            'password_hash' => $passwordHash,
            'user_id' => $forgotPassword['user_id']
        ]);

        unset($_SESSION['forgot_password']);

        $this->jsonResponse([
            'status' => 'success',
            'message' => 'Password reset successful'
        ]);
    }
    // zakariae : 8-May-26 : status function that checks if user is logged in or not 
    public function status() {
        if (isset($_SESSION['user_id'])) {
            $this->jsonResponse([
                'status' => 'success',
                'connected' => true,
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'name' => $_SESSION['user_name'] ?? 'User',
                    'email' => $_SESSION['user_email'] ?? '',
                    'role' => $_SESSION['user_role'] ?? 'user'
                ]
            ]);
        } else {
            $this->jsonResponse([
                'status' => 'success',
                'connected' => false
            ]);
        }
    }
}
