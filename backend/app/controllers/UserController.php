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

    public function index() {
        try {
            $stmt = $this->db->query("SELECT id, email, name, profile_url, status, role, last_login_at, created_at FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll();
            $this->jsonResponse(['status' => 'success', 'data' => $users]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 1. MODIFIER PROFIL (changer photo profil)
    public function updatePhoto() {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $profile_url = $data['profile_url'] ?? null;

        try {
            $stmt = $this->db->prepare("UPDATE users SET profile_url = ? WHERE email = ?");
            $stmt->execute([$profile_url, $email]);

            if ($stmt->rowCount() > 0) {
                $this->jsonResponse(['status' => 'success', 'message' => 'Photo de profil mise à jour avec succès']);
            } else {
                $this->jsonResponse(['status' => 'info', 'message' => 'Aucune modification apportée']);
            }
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 2. MODIFIER PROFIL (changer mot de passe)
    public function changePassword() {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $old_password = $data['old_password'] ?? '';
        $new_password = $data['new_password'] ?? '';

        try {
            // SELECT password_hash, email FROM users WHERE email = user_email
            $stmt = $this->db->prepare("SELECT password_hash FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($old_password, $user['password_hash'])) {
                $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
                $update = $this->db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
                $update->execute([$new_hash, $email]);
                $this->jsonResponse(['status' => 'success', 'message' => 'Mot de passe changé avec succès']);
            } else {
                $this->jsonResponse(['status' => 'error', 'message' => 'Ancien mot de passe incorrect'], 401);
            }
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // Forgot Password Flow
    public function sendResetCode() {
        // Mocking code generation and email sending
        $this->jsonResponse(['status' => 'success', 'message' => 'Code envoyé (Simulé)', 'code' => '123456']);
    }

    public function resetPassword() {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $new_password = $data['new_password'] ?? '';

        try {
            $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
            $stmt = $this->db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            $stmt->execute([$new_hash, $email]);
            $this->jsonResponse(['status' => 'success', 'message' => 'Mot de passe réinitialisé avec succès']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. MODIFIER PROFIL (changer nom)
    public function updateName() {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $name = $data['name'] ?? '';

        try {
            $stmt = $this->db->prepare("UPDATE users SET name = ? WHERE email = ?");
            $stmt->execute([$name, $email]);

            if ($stmt->rowCount() > 0) {
                $this->jsonResponse(['status' => 'success', 'message' => 'Nom changé avec succès']);
            } else {
                $this->jsonResponse(['status' => 'info', 'message' => 'Aucune modification apportée']);
            }
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. SUPPRIMER PROFIL (supprimer compte)
    public function deleteAccount() {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        try {
            // SELECT * FROM users WHERE email = user_email
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                // UPDATE users SET status = 'desactive' WHERE email = user_email
                $update = $this->db->prepare("UPDATE users SET status = 'desactive' WHERE email = ?");
                $update->execute([$email]);
                $this->jsonResponse(['status' => 'success', 'message' => 'Compte supprimé avec succès']);
            } else {
                $this->jsonResponse(['status' => 'error', 'message' => 'Mot de passe incorrecte'], 401);
            }
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}