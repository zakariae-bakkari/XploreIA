<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

class AdminModeleController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $this->requireAdmin();

        try {
            // Return one row per model. Use subqueries to fetch a single tool_id and the latest performance.
            $sql = "
                SELECT m.*,
                    (SELECT tm2.tool_id FROM tool_models tm2 WHERE tm2.model_id = m.id LIMIT 1) AS tool_id,
                    (SELECT a.name FROM ai_tools a WHERE a.id = (
                        SELECT tm3.tool_id FROM tool_models tm3 WHERE tm3.model_id = m.id LIMIT 1
                    ) LIMIT 1) AS tool_name,
                    (SELECT p2.response_quality FROM performance p2 WHERE p2.model_id = m.id ORDER BY p2.created_at DESC LIMIT 1) AS response_quality,
                    (SELECT p2.speed FROM performance p2 WHERE p2.model_id = m.id ORDER BY p2.created_at DESC LIMIT 1) AS speed
                FROM models m
                WHERE m.status = 'active'
                ORDER BY m.created_at DESC
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $models = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->jsonResponse(['status' => 'success', 'data' => $models]);
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
            $sql = "SELECT m.* FROM models m WHERE m.id = :id LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $model = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$model) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Model not found'], 404);
            }

            // get linked tools
            $stmt = $this->db->prepare("SELECT tool_id FROM tool_models WHERE model_id = :id");
            $stmt->execute([':id' => $id]);
            $tools = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // get linked characteristics (ids)
            $stmt = $this->db->prepare("SELECT characteristic_id FROM model_characteristics WHERE model_id = :id");
            $stmt->execute([':id' => $id]);
            $characteristics = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // get performance
            $stmt = $this->db->prepare("SELECT * FROM performance WHERE model_id = :id ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([':id' => $id]);
            $performance = $stmt->fetch(PDO::FETCH_ASSOC);

            $model['tools'] = $tools;
            $model['performance'] = $performance;
            $model['characteristics'] = $characteristics;

            $this->jsonResponse(['status' => 'success', 'data' => $model]);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function store() {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) $data = $_POST;

        $name = $data['name'] ?? null;
        $description = $data['description'] ?? null;
        $tags = $data['tags'] ?? null;
        $status = $data['status'] ?? 'active';
        // normalize empty status -> active (protect against client sending empty string)
        if ($status === '' || $status === null) $status = 'active';
        $provider_id = $data['provider_id'] ?? null;
        if ($provider_id === '' || $provider_id === 0) $provider_id = null;
        $tool_id = $data['tool_id'] ?? null;
        $created_by = $_SESSION['user_id'] ?? null;

        if (!$name) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);
        }

        try {
            $this->db->beginTransaction();

            $id = $this->generateUUID();
            $now = date('Y-m-d H:i:s');

            $sql = "INSERT INTO models (id, provider_id, created_by, name, description, tags, status, created_at, updated_at) VALUES (:id, :provider_id, :created_by, :name, :description, :tags, :status, :created_at, :updated_at)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':provider_id' => $provider_id,
                ':created_by' => $created_by,
                ':name' => $name,
                ':description' => $description,
                ':tags' => $tags,
                ':status' => $status,
                ':created_at' => $now,
                ':updated_at' => $now
            ]);

            if ($tool_id) {
                $linkId = $this->generateUUID();
                $stmt = $this->db->prepare("INSERT INTO tool_models (id, tool_id, model_id) VALUES (:id, :tool_id, :model_id)");
                $stmt->execute([':id' => $linkId, ':tool_id' => $tool_id, ':model_id' => $id]);
            }

            // performance optional
            if (!empty($data['performance']) && is_array($data['performance'])) {
                $perfId = $this->generateUUID();
                $stmt = $this->db->prepare("INSERT INTO performance (id, model_id, response_quality, speed, created_at) VALUES (:id, :model_id, :response_quality, :speed, :created_at)");
                $stmt->execute([
                    ':id' => $perfId,
                    ':model_id' => $id,
                    ':response_quality' => $data['performance']['response_quality'] ?? null,
                    ':speed' => $data['performance']['speed'] ?? null,
                    ':created_at' => $now
                ]);
            }

            // characteristics optional (many-to-many)
            if (!empty($data['characteristics']) && is_array($data['characteristics'])) {
                $stmt = $this->db->prepare("INSERT INTO model_characteristics (id, model_id, characteristic_id) VALUES (:id, :model_id, :char_id)");
                foreach ($data['characteristics'] as $charId) {
                    $mcId = $this->generateUUID();
                    $stmt->execute([':id' => $mcId, ':model_id' => $id, ':char_id' => $charId]);
                }
            }

            $this->db->commit();

            $this->jsonResponse(['status' => 'success', 'data' => ['id' => $id]] , 201);
        } catch (\Exception $e) {
            $this->db->rollBack();
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

        $fields = [];
        $params = [':id' => $id];
        $allowed = ['name','description','tags','status','provider_id','validated_by'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "{$f} = :{$f}";
                // normalize empty strings to NULL for FK-safe updates
                $val = $data[$f];
                // For status, treat empty -> 'active' instead of NULL
                if ($f === 'status') {
                    if ($val === '' || $val === null) {
                        $val = 'active';
                    }
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
        $sql = "UPDATE models SET " . implode(', ', $fields) . ", updated_at = :updated_at WHERE id = :id";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // update performance if provided
            if (!empty($data['performance']) && is_array($data['performance'])) {
                $now = date('Y-m-d H:i:s');
                $perfId = $this->generateUUID();
                $stmt = $this->db->prepare("INSERT INTO performance (id, model_id, response_quality, speed, created_at) VALUES (:id, :model_id, :response_quality, :speed, :created_at)");
                $stmt->execute([
                    ':id' => $perfId,
                    ':model_id' => $id,
                    ':response_quality' => $data['performance']['response_quality'] ?? null,
                    ':speed' => $data['performance']['speed'] ?? null,
                    ':created_at' => $now
                ]);
            }

            // update characteristics if provided: replace existing
            if (array_key_exists('characteristics', $data)) {
                $this->db->beginTransaction();
                $del = $this->db->prepare("DELETE FROM model_characteristics WHERE model_id = :id");
                $del->execute([':id' => $id]);
                if (!empty($data['characteristics']) && is_array($data['characteristics'])) {
                    $ins = $this->db->prepare("INSERT INTO model_characteristics (id, model_id, characteristic_id) VALUES (:id, :model_id, :char_id)");
                    foreach ($data['characteristics'] as $charId) {
                        $mcId = $this->generateUUID();
                        $ins->execute([':id' => $mcId, ':model_id' => $id, ':char_id' => $charId]);
                    }
                }
                $this->db->commit();
            }

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
                $this->db->beginTransaction();

                $now = date('Y-m-d H:i:s');
                $stmt = $this->db->prepare("UPDATE models SET status = :status, updated_at = :updated_at WHERE id = :id");
                $stmt->execute([':status' => 'deleted', ':updated_at' => $now, ':id' => $id]);

                $this->db->commit();

                $this->jsonResponse(['status' => 'success', 'message' => 'Soft-deleted']);
        } catch (\Exception $e) {
            $this->db->rollBack();
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
