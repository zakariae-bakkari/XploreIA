<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use Exception;
use PDO;

class AdminAiToolController extends Controller
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
            $query = 'SELECT t.*, c.name as category_name, p.name as provider_name 
                      FROM ai_tools t 
                      LEFT JOIN categories c ON t.main_category_id = c.id 
                      LEFT JOIN providers p ON t.provider_id = p.id
                      ORDER BY t.created_at DESC';
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $tools = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'status' => 'success',
                'data' => $tools
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
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
            // Fetch tool
            $sql = 'SELECT * FROM ai_tools WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $tool = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$tool) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Tool not found'], 404);
                return;
            }

            // Fetch advantages
            $advStmt = $this->db->prepare('SELECT id, advantage_name FROM advantages WHERE tool_id = :id');
            $advStmt->execute([':id' => $id]);
            $tool['advantages'] = $advStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch disadvantages
            $disadvStmt = $this->db->prepare('SELECT id, disadvantage_name FROM disadvantages WHERE tool_id = :id');
            $disadvStmt->execute([':id' => $id]);
            $tool['disadvantages'] = $disadvStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch models
            $modelStmt = $this->db->prepare('SELECT m.id, m.name FROM models m JOIN tool_models tm ON m.id = tm.model_id WHERE tm.tool_id = :id');
            $modelStmt->execute([':id' => $id]);
            $tool['models'] = $modelStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch characteristics
            $charStmt = $this->db->prepare('SELECT c.id, c.name, c.type FROM characteristics c JOIN tool_characteristics tc ON c.id = tc.characteristic_id WHERE tc.tool_id = :id');
            $charStmt->execute([':id' => $id]);
            $tool['characteristics'] = $charStmt->fetchAll(PDO::FETCH_ASSOC);
 
            $this->jsonResponse(['status' => 'success', 'data' => $tool]);
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
            $toolId = $stmt->fetch(PDO::FETCH_ASSOC)['uuid'];

            $sql = 'INSERT INTO ai_tools (id, name, description, main_category_id, provider_id, website_url, pricing_model, status, created_at) 
                    VALUES (:id, :name, :description, :main_category_id, :provider_id, :website_url, :pricing_model, :status, NOW())';
            $insertStmt = $this->db->prepare($sql);
            
            $insertStmt->execute([
                ':id' => $toolId,
                ':name' => $name,
                ':description' => $data['description'] ?? null,
                ':main_category_id' => empty($data['main_category_id']) ? null : $data['main_category_id'],
                ':provider_id' => empty($data['provider_id']) ? null : $data['provider_id'],
                ':website_url' => $data['website_url'] ?? null,
                ':pricing_model' => $data['pricing_model'] ?? 'freemium',
                ':status' => $data['status'] ?? 'draft'
            ]);

            // Insert advantages
            if (isset($data['advantages']) && is_array($data['advantages'])) {
                $advStmt = $this->db->prepare('INSERT INTO advantages (id, tool_id, advantage_name, created_at) VALUES ((SELECT UUID()), :tool_id, :name, NOW())');
                foreach ($data['advantages'] as $adv) {
                    if (is_array($adv)) $adv = $adv['advantage_name'] ?? '';
                    if (trim($adv)) {
                        $advStmt->execute([':tool_id' => $toolId, ':name' => trim($adv)]);
                    }
                }
            }

            // Insert disadvantages
            if (isset($data['disadvantages']) && is_array($data['disadvantages'])) {
                $disadvStmt = $this->db->prepare('INSERT INTO disadvantages (id, tool_id, disadvantage_name, created_at) VALUES ((SELECT UUID()), :tool_id, :name, NOW())');
                foreach ($data['disadvantages'] as $disadv) {
                    if (is_array($disadv)) $disadv = $disadv['disadvantage_name'] ?? '';
                    if (trim($disadv)) {
                        $disadvStmt->execute([':tool_id' => $toolId, ':name' => trim($disadv)]);
                    }
                }
            }

            // Insert models
            if (isset($data['models']) && is_array($data['models'])) {
                $insModel = $this->db->prepare('INSERT INTO tool_models (id, tool_id, model_id) VALUES ((SELECT UUID()), :tool_id, :model_id)');
                foreach ($data['models'] as $modelId) {
                    if (trim($modelId)) {
                        $insModel->execute([':tool_id' => $toolId, ':model_id' => trim($modelId)]);
                    }
                }
            }

            // Insert characteristics
            if (isset($data['characteristics']) && is_array($data['characteristics'])) {
                $insChar = $this->db->prepare('INSERT INTO tool_characteristics (tool_id, characteristic_id) VALUES (:tool_id, :characteristic_id)');
                foreach ($data['characteristics'] as $charId) {
                    if (trim($charId)) {
                        $insChar->execute([':tool_id' => $toolId, ':characteristic_id' => trim($charId)]);
                    }
                }
            }
 
            $this->db->commit();
            $this->jsonResponse(['status' => 'success', 'message' => 'AI Tool created', 'id' => $toolId], 201);
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
            
            $updatable = ['name', 'description', 'main_category_id', 'provider_id', 'website_url', 'pricing_model', 'status'];
            foreach ($updatable as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = empty($data[$field]) && in_array($field, ['main_category_id', 'provider_id']) ? null : $data[$field];
                }
            }

            if (!empty($fields)) {
                $fields[] = 'updated_at = NOW()';
                $sql = 'UPDATE ai_tools SET ' . implode(', ', $fields) . ' WHERE id = :id';
                $stmt = $this->db->prepare($sql);
                $stmt->execute($params);
            }

            // Update advantages (delete old, insert new)
            if (isset($data['advantages']) && is_array($data['advantages'])) {
                $delAdv = $this->db->prepare('DELETE FROM advantages WHERE tool_id = :id');
                $delAdv->execute([':id' => $id]);
                
                $advStmt = $this->db->prepare('INSERT INTO advantages (id, tool_id, advantage_name, created_at) VALUES ((SELECT UUID()), :tool_id, :name, NOW())');
                foreach ($data['advantages'] as $adv) {
                    if (is_array($adv)) $adv = $adv['advantage_name'] ?? '';
                    if (trim($adv)) {
                        $advStmt->execute([':tool_id' => $id, ':name' => trim($adv)]);
                    }
                }
            }

            // Update disadvantages
            if (isset($data['disadvantages']) && is_array($data['disadvantages'])) {
                $delDisadv = $this->db->prepare('DELETE FROM disadvantages WHERE tool_id = :id');
                $delDisadv->execute([':id' => $id]);
                
                $disadvStmt = $this->db->prepare('INSERT INTO disadvantages (id, tool_id, disadvantage_name, created_at) VALUES ((SELECT UUID()), :tool_id, :name, NOW())');
                foreach ($data['disadvantages'] as $disadv) {
                    if (is_array($disadv)) $disadv = $disadv['disadvantage_name'] ?? '';
                    if (trim($disadv)) {
                        $disadvStmt->execute([':tool_id' => $id, ':name' => trim($disadv)]);
                    }
                }
            }

            // Update models
            if (isset($data['models']) && is_array($data['models'])) {
                $delModels = $this->db->prepare('DELETE FROM tool_models WHERE tool_id = :id');
                $delModels->execute([':id' => $id]);
                
                $insModel = $this->db->prepare('INSERT INTO tool_models (id, tool_id, model_id) VALUES ((SELECT UUID()), :tool_id, :model_id)');
                foreach ($data['models'] as $modelId) {
                    if (trim($modelId)) {
                        $insModel->execute([':tool_id' => $id, ':model_id' => trim($modelId)]);
                    }
                }
            }

            // Update characteristics
            if (isset($data['characteristics']) && is_array($data['characteristics'])) {
                $delChars = $this->db->prepare('DELETE FROM tool_characteristics WHERE tool_id = :id');
                $delChars->execute([':id' => $id]);
                
                $insChar = $this->db->prepare('INSERT INTO tool_characteristics (tool_id, characteristic_id) VALUES (:tool_id, :characteristic_id)');
                foreach ($data['characteristics'] as $charId) {
                    if (trim($charId)) {
                        $insChar->execute([':tool_id' => $id, ':characteristic_id' => trim($charId)]);
                    }
                }
            }
 
            $this->db->commit();
            $this->jsonResponse(['status' => 'success', 'message' => 'AI Tool updated']);
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
            $sql = 'DELETE FROM ai_tools WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            $this->jsonResponse(['status' => 'success', 'message' => "AI Tool with id $id was deleted"]);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
