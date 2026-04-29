<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

class PlaylistController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Voir mes playlists
     * SELECT * FROM playlists WHERE user_id = current_user_id
     */
    public function index() {
        $email = $_GET['email'] ?? '';
        try {
            $stmt = $this->db->prepare("
                SELECT p.*, (SELECT COUNT(*) FROM playlist_items WHERE playlist_id = p.id) as item_count 
                FROM playlists p 
                JOIN users u ON p.user_id = u.id 
                WHERE u.email = ?
            ");
            $stmt->execute([$email]);
            $playlists = $stmt->fetchAll();
            $this->jsonResponse(['status' => 'success', 'data' => $playlists]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Créer une playlist
     * INSERT INTO playlists (user_id, name, description, created_at) VALUES (...)
     */
    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $name = $data['name'] ?? '';
        $description = $data['description'] ?? '';

        try {
            $userStmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $userStmt->execute([$email]);
            $user = $userStmt->fetch();

            if (!$user) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Utilisateur non trouvé'], 404);
                return;
            }

            $stmt = $this->db->prepare("INSERT INTO playlists (user_id, name, description, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$user['id'], $name, $description]);

            $this->jsonResponse(['status' => 'success', 'message' => 'Playlist créée']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * MODIFIER UNE PLAYLIST
     * UPDATE playlists SET name = :new_name, description = :new_description, updated_at = NOW() 
     * WHERE id = :playlist_id AND user_id = :current_user_id
     */
    public function update() {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? '';
        $email = $data['email'] ?? ''; // to identify user
        $name = $data['name'] ?? '';
        $description = $data['description'] ?? '';

        try {
            $userStmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $userStmt->execute([$email]);
            $user = $userStmt->fetch();

            $stmt = $this->db->prepare("
                UPDATE playlists 
                SET name = ?, description = ?, updated_at = NOW() 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$name, $description, $id, $user['id']]);

            if ($stmt->rowCount() > 0) {
                $this->jsonResponse(['status' => 'success', 'message' => 'Playlist modifiée avec succès']);
            } else {
                $this->jsonResponse(['status' => 'error', 'message' => 'Erreur : playlist introuvable ou vous n\'êtes pas autorisé'], 403);
            }
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer une playlist entière
     * DELETE FROM playlist_items WHERE playlist_id = id puis DELETE FROM playlists WHERE id = id
     */
    public function delete() {
        $id = $_GET['id'] ?? '';
        try {
            // Transaction-like sequential delete
            $stmtItems = $this->db->prepare("DELETE FROM playlist_items WHERE playlist_id = ?");
            $stmtItems->execute([$id]);

            $stmtPl = $this->db->prepare("DELETE FROM playlists WHERE id = ?");
            $stmtPl->execute([$id]);

            $this->jsonResponse(['status' => 'success', 'message' => 'Playlist supprimée']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Voir le contenu d'une playlist
     * SELECT * FROM playlist_items JOIN ai_tools ...
     */
    public function getContent() {
        $id = $_GET['id'] ?? '';
        try {
            $stmt = $this->db->prepare("
                SELECT pi.*, t.name as tool_name, t.description as tool_desc, t.logo_url 
                FROM playlist_items pi 
                JOIN ai_tools t ON pi.tool_id = t.id 
                WHERE pi.playlist_id = ?
            ");
            $stmt->execute([$id]);
            $items = $stmt->fetchAll();
            $this->jsonResponse(['status' => 'success', 'data' => $items]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
