<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

// noureddine 
class UserController extends Controller
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index()
    {
        $this->requireAdmin();
        $search = $_GET['search'] ?? null;
        $status = $_GET['status'] ?? null;
        $role = $_GET['role'] ?? null;

        try {
            $query = "SELECT id, email, name, profile_url, status, role, created_at FROM users WHERE 1=1";
            $params = [];

            if ($search) {
                $query .= " AND (name LIKE :search OR email LIKE :search)";
                $params[':search'] = "%$search%";
            }
            if ($status) {
                $query .= " AND status = :status";
                $params[':status'] = $status;
            }
            if ($role) {
                $query .= " AND role = :role";
                $params[':role'] = $role;
            }

            $query .= " ORDER BY created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $users = $stmt->fetchAll();
            $this->jsonResponse(['status' => 'success', 'data' => $users]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function show()
    {
        $this->requireAdmin();

        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID is required'], 400);
            return;
        }

        try {
            $stmt = $this->db->prepare("SELECT id, email, name, profile_url, status, role, created_at FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch();

            if ($user) {
                $this->jsonResponse(['status' => 'success', 'data' => $user]);
            } else {
                $this->jsonResponse(['status' => 'error', 'message' => 'User not found'], 404);
            }
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 1. MODIFIER PROFIL (changer photo profil)
    public function updatePhoto()
    {
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
    public function changePassword()
    {
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
    public function sendResetCode()
    {
        // Mocking code generation and email sending
        $this->jsonResponse(['status' => 'success', 'message' => 'Code envoyé (Simulé)', 'code' => '123456']);
    }

    public function resetPassword()
    {
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
    public function updateName()
    {
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
    public function deleteAccount()
    {
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

    /**
     * Comprehensive profile data
     * Includes personal info, playlists, and suggested tools
     */
    public function profile()
    {
        $email = $_GET['email'] ?? '';
        if (!$email && isset($_SESSION['user_email'])) {
            $email = $_SESSION['user_email'];
        }

        if (!$email) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Email is required'], 400);
            return;
        }

        try {
            // 1. Fetch User Info
            $userStmt = $this->db->prepare("SELECT id, email, name, profile_url, status, role, created_at FROM users WHERE email = ?");
            $userStmt->execute([$email]);
            $user = $userStmt->fetch();

            if (!$user) {
                $this->jsonResponse(['status' => 'error', 'message' => 'User not found'], 404);
                return;
            }

            // 2. Fetch Playlists
            $plStmt = $this->db->prepare("
                SELECT p.*, (SELECT COUNT(*) FROM playlist_items WHERE playlist_id = p.id) as item_count 
                FROM playlists p 
                WHERE p.user_id = ?
            ");
            $plStmt->execute([$user['id']]);
            $user['playlists'] = $plStmt->fetchAll();

            // 3. Fetch Suggested Tools: simplified — prefer `user_id`, then `created_by_email`, else empty.
            $user['suggestions'] = [];
            try {
                $stmt = null;
                $check = $this->db->query("SHOW COLUMNS FROM ai_tools LIKE 'user_id'");
                if ($check && $check->fetch()) {
                    $stmt = $this->db->prepare("SELECT id, name, description, status, created_at FROM ai_tools WHERE user_id = ? AND status != 'published' ORDER BY created_at DESC");
                    $stmt->execute([$user['id']]);
                } else {
                    $check = $this->db->query("SHOW COLUMNS FROM ai_tools LIKE 'created_by_email'");
                    if ($check && $check->fetch()) {
                        $stmt = $this->db->prepare("SELECT id, name, description, status, created_at FROM ai_tools WHERE created_by_email = ? AND status != 'published' ORDER BY created_at DESC");
                        $stmt->execute([$user['email']]);
                    }
                }

                if ($stmt) {
                    $user['suggestions'] = $stmt->fetchAll();
                } else {
                    $user['suggestions'] = [];
                }
            } catch (\Exception $e) {
                $user['suggestions'] = [];
            }

            $this->jsonResponse(['status' => 'success', 'data' => $user]);

        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function suspend()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = $input['user_id'] ?? $_GET['user_id'] ?? null;

        if (!$userId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'User ID is required'], 400);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE users SET status = 'banned' WHERE id = ?");
            $stmt->execute([$userId]);
            $this->jsonResponse(['status' => 'success', 'message' => 'User suspended successfully']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function unsuspend()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = $input['user_id'] ?? $_GET['user_id'] ?? null;

        if (!$userId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'User ID is required'], 400);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE users SET status = 'active' WHERE id = ?");
            $stmt->execute([$userId]);
            $this->jsonResponse(['status' => 'success', 'message' => 'User unsuspended successfully']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function changeRole()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = $input['user_id'] ?? null;
        $role = $input['role'] ?? null;

        if (!$userId || !$role) {
            $this->jsonResponse(['status' => 'error', 'message' => 'User ID and Role are required'], 400);
            return;
        }

        if (!in_array($role, ['admin', 'user'], true)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid role specified'], 400);
            return;
        }

        try {
            if ($userId === $_SESSION['user_id']) {
                $this->jsonResponse(['status' => 'error', 'message' => 'You cannot change your own role'], 403);
                return;
            }

            $stmt = $this->db->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$role, $userId]);
            $this->jsonResponse(['status' => 'success', 'message' => 'User role updated successfully']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function delete()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = $input['user_id'] ?? $_GET['user_id'] ?? null;

        if (!$userId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'User ID is required'], 400);
            return;
        }

        if ($userId === $_SESSION['user_id']) {
            $this->jsonResponse(['status' => 'error', 'message' => 'You cannot delete your own account from here'], 403);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Delete playlist items and playlists
            $stmt = $this->db->prepare("DELETE FROM playlist_items WHERE playlist_id IN (SELECT id FROM playlists WHERE user_id = ?)");
            $stmt->execute([$userId]);

            $stmt = $this->db->prepare("DELETE FROM playlists WHERE user_id = ?");
            $stmt->execute([$userId]);

            // Delete reviews
            $stmt = $this->db->prepare("DELETE FROM reviews WHERE user_id = ?");
            $stmt->execute([$userId]);

            // Delete the user
            $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            $this->db->commit();
            $this->jsonResponse(['status' => 'success', 'message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}