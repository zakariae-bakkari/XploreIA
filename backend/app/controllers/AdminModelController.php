<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use Exception;
use PDO;

class AdminModelController extends Controller
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index()
    {
        $this->requireAdmin();
        try {
            $query = 'SELECT m.*, p.name as provider_name 
                      FROM models m 
                      LEFT JOIN providers p ON m.provider_id = p.id
                      ORDER BY m.created_at DESC';
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $models = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'status' => 'success',
                'data' => $models
            ]);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function show()
    {
        $this->requireAdmin();

        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID parameter is required'], 400);
            return;
        }

        try {
            // Fetch model
            $sql = 'SELECT * FROM models WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $model = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$model) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Model not found'], 404);
                return;
            }

            // Fetch performance
            $perfStmt = $this->db->prepare('SELECT id, response_quality, speed FROM performance WHERE model_id = :id');
            $perfStmt->execute([':id' => $id]);
            $model['performance'] = $perfStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch characteristics
            $charStmt = $this->db->prepare('SELECT c.id, c.name FROM characteristics c JOIN model_characteristics mc ON c.id = mc.characteristic_id WHERE mc.model_id = :id');
            $charStmt->execute([':id' => $id]);
            $model['characteristics'] = $charStmt->fetchAll(PDO::FETCH_ASSOC);

            $this->jsonResponse(['status' => 'success', 'data' => $model]);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);
            return;
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->query("SELECT UUID() as uuid");
            $modelId = $stmt->fetch(PDO::FETCH_ASSOC)['uuid'];

            $sql = 'INSERT INTO models (id, name, description, tags, provider_id, status, created_at) 
                    VALUES (:id, :name, :description, :tags, :provider_id, :status, NOW())';
            $insertStmt = $this->db->prepare($sql);
            
            $insertStmt->execute([
                ':id' => $modelId,
                ':name' => $name,
                ':description' => $data['description'] ?? null,
                ':tags' => is_array($data['tags'] ?? '') ? implode(',', $data['tags']) : ($data['tags'] ?? null),
                ':provider_id' => empty($data['provider_id']) ? null : $data['provider_id'],
                ':status' => $data['status'] ?? 'active'
            ]);

            // Insert performance
            if (isset($data['performance']) && is_array($data['performance'])) {
                $perfStmt = $this->db->prepare('INSERT INTO performance (id, model_id, response_quality, speed, created_at) VALUES ((SELECT UUID()), :model_id, :response_quality, :speed, NOW())');
                foreach ($data['performance'] as $perf) {
                    $perfStmt->execute([
                        ':model_id' => $modelId, 
                        ':response_quality' => $perf['response_quality'] ?? 0,
                        ':speed' => $perf['speed'] ?? 0
                    ]);
                }
            }

            // Insert characteristics
            if (isset($data['characteristics']) && is_array($data['characteristics'])) {
                $charStmt = $this->db->prepare('INSERT INTO model_characteristics (id, model_id, characteristic_id) VALUES ((SELECT UUID()), :model_id, :characteristic_id)');
                foreach ($data['characteristics'] as $charId) {
                    if (is_array($charId)) $charId = $charId['id'] ?? $charId['characteristic_id'] ?? '';
                    if (trim($charId)) {
                        $charStmt->execute([':model_id' => $modelId, ':characteristic_id' => trim($charId)]);
                    }
                }
            }

            $this->db->commit();
            $this->jsonResponse(['status' => 'success', 'message' => 'Model created', 'id' => $modelId], 201);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function update($id = null)
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = $id ?? ($_GET['id'] ?? ($data['id'] ?? null));

        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID is required'], 400);
            return;
        }

        try {
            $this->db->beginTransaction();

            $fields = [];
            $params = [':id' => $id];
            
            $updatable = ['name', 'description', 'provider_id', 'status'];
            foreach ($updatable as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = empty($data[$field]) && $field === 'provider_id' ? null : $data[$field];
                }
            }
            if (array_key_exists('tags', $data)) {
                $fields[] = "tags = :tags";
                $params[':tags'] = is_array($data['tags']) ? implode(',', $data['tags']) : $data['tags'];
            }

            if (!empty($fields)) {
                $fields[] = 'updated_at = NOW()';
                $sql = 'UPDATE models SET ' . implode(', ', $fields) . ' WHERE id = :id';
                $stmt = $this->db->prepare($sql);
                $stmt->execute($params);
            }

            // Update performance
            if (isset($data['performance']) && is_array($data['performance'])) {
                $delPerf = $this->db->prepare('DELETE FROM performance WHERE model_id = :id');
                $delPerf->execute([':id' => $id]);
                
                $perfStmt = $this->db->prepare('INSERT INTO performance (id, model_id, response_quality, speed, created_at) VALUES ((SELECT UUID()), :model_id, :response_quality, :speed, NOW())');
                foreach ($data['performance'] as $perf) {
                    $perfStmt->execute([
                        ':model_id' => $id, 
                        ':response_quality' => $perf['response_quality'] ?? 0,
                        ':speed' => $perf['speed'] ?? 0
                    ]);
                }
            }

            // Update characteristics
            if (isset($data['characteristics']) && is_array($data['characteristics'])) {
                $delChar = $this->db->prepare('DELETE FROM model_characteristics WHERE model_id = :id');
                $delChar->execute([':id' => $id]);
                
                $charStmt = $this->db->prepare('INSERT INTO model_characteristics (id, model_id, characteristic_id) VALUES ((SELECT UUID()), :model_id, :characteristic_id)');
                foreach ($data['characteristics'] as $charId) {
                    if (is_array($charId)) $charId = $charId['id'] ?? $charId['characteristic_id'] ?? '';
                    if (trim($charId)) {
                        $charStmt->execute([':model_id' => $id, ':characteristic_id' => trim($charId)]);
                    }
                }
            }

            $this->db->commit();
            $this->jsonResponse(['status' => 'success', 'message' => 'Model updated']);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = $_GET['id'] ?? $input['id'] ?? null;

        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID is required'], 400);
            return;
        }

        try {
            $sql = 'DELETE FROM models WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            $this->jsonResponse(['status' => 'success', 'message' => "Model with id $id was deleted"]);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
