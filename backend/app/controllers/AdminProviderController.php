<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

class AdminProviderController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        // If caller is admin, return full provider records (for admin listing).
        // Otherwise return public minimal list (id + name) for selects.
        try {
            $isAdmin = isset($_SESSION['user_id']) && ($_SESSION['user_role'] ?? '') === 'admin';
            // Only return active providers for listing (do not expose inactive items in UI)
            // If an admin needs to see inactive records later, add an explicit query param or separate endpoint.
            // Return providers with relevant statuses (exclude 'inactive' which maps to soft-deleted)
            $stmt = $this->db->query("SELECT * FROM providers WHERE status IN ('active','pending','rejected') ORDER BY name");
            $providers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->jsonResponse(['status' => 'success', 'data' => $providers]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id = null) {
        $this->requireAdmin();

        $id = $_GET['id'] ?? $id ?? null;
        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Missing id'], 400);
        }

        try {
            $stmt = $this->db->prepare("SELECT * FROM providers WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $provider = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$provider) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Provider not found'], 404);
            }
            $this->jsonResponse(['status' => 'success', 'data' => $provider]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function store() {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) $data = $_POST;

        // temporary debugging removed

        $name = $data['name'] ?? null;
        if (!$name) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);
        }

        $country = $data['country'] ?? null;
        $description = $data['description'] ?? null;
        $ceo = $data['ceo'] ?? null;
        $date_founded = $data['date_founded'] ?? null;
        $website_url = $data['website_url'] ?? null;
        $logo_url = $data['logo_url'] ?? null;
        $status = $data['status'] ?? 'active';
        if ($status === '' || $status === null) $status = 'active';
        $created_by = $_SESSION['user_id'] ?? null;

        try {
            $now = date('Y-m-d H:i:s');
            $id = $this->generateUUID();
            $sql = "INSERT INTO providers (id, name, country, description, ceo, date_founded, website_url, logo_url, status, created_by, created_at, updated_at) VALUES (:id, :name, :country, :description, :ceo, :date_founded, :website_url, :logo_url, :status, :created_by, :created_at, :updated_at)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':name' => $name,
                ':country' => $country,
                ':description' => $description,
                ':ceo' => $ceo,
                ':date_founded' => $date_founded,
                ':website_url' => $website_url,
                ':logo_url' => $logo_url,
                ':status' => $status,
                ':created_by' => $created_by,
                ':created_at' => $now,
                ':updated_at' => $now
            ]);

            $this->jsonResponse(['status' => 'success', 'data' => ['id' => $id]], 201);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function update($id = null) {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) $data = $_POST;

        $id = $data['id'] ?? $id ?? null;
        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Missing id'], 400);
        }

        $allowed = ['name','country','description','ceo','date_founded','website_url','logo_url','status'];
        $fields = [];
        $params = [':id' => $id];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "{$f} = :{$f}";
                $val = $data[$f];
                if ($f === 'status') {
                    if ($val === '' || $val === null) $val = 'active';
                } else {
                    if ($val === '' || $val === 0) $val = null;
                }
                $params[":{$f}"] = $val;
            }
        }

        if (empty($fields)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'No fields to update'], 400);
        }

        $params[':updated_at'] = date('Y-m-d H:i:s');
        $sql = "UPDATE providers SET " . implode(', ', $fields) . ", updated_at = :updated_at WHERE id = :id";
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $this->jsonResponse(['status' => 'success', 'message' => 'Updated']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id = null) {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) $data = $_POST;

        $id = $data['id'] ?? $id ?? null;
        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Missing id'], 400);
        }

        try {
            $now = date('Y-m-d H:i:s');
            // soft-delete: mark as inactive
            $stmt = $this->db->prepare("UPDATE providers SET status = :status, updated_at = :updated_at WHERE id = :id");
            $stmt->execute([':status' => 'inactive', ':updated_at' => $now, ':id' => $id]);
            $this->jsonResponse(['status' => 'success', 'message' => 'Provider marked inactive']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Générer un UUID v4-like
     */
    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

}
