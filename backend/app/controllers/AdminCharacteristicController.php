<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use Exception;
use PDO;

class AdminCharacteristicController extends Controller
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
            // Fetch all characteristics
            $query = 'SELECT c.id, c.name, c.description, c.type, c.status, c.created_at, 
                      (SELECT COUNT(*) FROM tool_characteristics tc WHERE tc.characteristic_id = c.id) as tool_count,
                      (SELECT COUNT(*) FROM model_characteristics mc WHERE mc.characteristic_id = c.id) as model_count
                      FROM characteristics c';
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $characteristics = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'status' => 'success',
                'data' => $characteristics
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
            $sql = 'SELECT id, name, description, type, status, created_at FROM characteristics WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $char = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$char) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Characteristic not found'], 404);
                return;
            }

            $this->jsonResponse(['status' => 'success', 'data' => $char]);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $name = trim($data['name'] ?? '');
        $description = $data['description'] ?? null;
        $type = trim($data['type'] ?? 'other');
        $status = trim($data['status'] ?? 'active');

        if (empty($name)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);
            return;
        }

        // Validate ENUM type values
        $validTypes = ['capability', 'limitation', 'modality', 'language', 'integration', 'other'];
        if (!in_array($type, $validTypes, true)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid type specified'], 400);
            return;
        }

        // Validate ENUM status values
        $validStatuses = ['active', 'inactive', 'pending', 'rejected'];
        if (!in_array($status, $validStatuses, true)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Invalid status specified'], 400);
            return;
        }

        try {
            // Check duplicate case-insensitive under the same type
            $checkStmt = $this->db->prepare('SELECT COUNT(*) as count FROM characteristics WHERE name = :name AND type = :type');
            $checkStmt->execute([':name' => $name, ':type' => $type]);
            $count = (int)$checkStmt->fetch(PDO::FETCH_ASSOC)['count'];
            if ($count > 0) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Characteristic already exists under this type'], 400);
                return;
            }

            $createdBy = $_SESSION['user_id'] ?? null;

            $sql = 'INSERT INTO characteristics (name, description, type, status, created_by, created_at) 
                    VALUES (:name, :description, :type, :status, :created_by, NOW())';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':name' => $name, 
                ':description' => $description, 
                ':type' => $type,
                ':status' => $status,
                ':created_by' => $createdBy
            ]);
            $id = $this->db->lastInsertId();

            $this->jsonResponse(['status' => 'success', 'message' => 'Characteristic created', 'id' => $id], 201);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function update()
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        
        $id = $data['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID is required'], 400);
            return;
        }

        $name = array_key_exists('name', $data) ? trim($data['name']) : null;
        $description = array_key_exists('description', $data) ? $data['description'] : null;
        $type = array_key_exists('type', $data) ? trim($data['type']) : null;
        $status = array_key_exists('status', $data) ? trim($data['status']) : null;

        if ($name === null && $description === null && $type === null && $status === null) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Nothing to update'], 400);
            return;
        }

        // Validate ENUM type values if provided
        if ($type !== null) {
            $validTypes = ['capability', 'limitation', 'modality', 'language', 'integration', 'other'];
            if (!in_array($type, $validTypes, true)) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Invalid type specified'], 400);
                return;
            }
        }

        // Validate ENUM status values if provided
        if ($status !== null) {
            $validStatuses = ['active', 'inactive', 'pending', 'rejected'];
            if (!in_array($status, $validStatuses, true)) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Invalid status specified'], 400);
                return;
            }
        }

        try {
            if ($name !== null) {
                // Get current type of the characteristic if type is not being updated
                $currentType = $type;
                if ($currentType === null) {
                    $typeQuery = $this->db->prepare('SELECT type FROM characteristics WHERE id = :id');
                    $typeQuery->execute([':id' => $id]);
                    $currentType = $typeQuery->fetchColumn();
                }

                // Check duplicate on other characteristics of the same type
                $checkStmt = $this->db->prepare('SELECT COUNT(*) as count FROM characteristics WHERE name = :name AND type = :type AND id != :id');
                $checkStmt->execute([':name' => $name, ':type' => $currentType, ':id' => $id]);
                $count = (int)$checkStmt->fetch(PDO::FETCH_ASSOC)['count'];
                if ($count > 0) {
                    $this->jsonResponse(['status' => 'error', 'message' => 'Characteristic name already exists under this type'], 400);
                    return;
                }
            }

            $fields = [];
            $params = [':id' => $id];
            if ($name !== null) { $fields[] = 'name = :name'; $params[':name'] = $name; }
            if ($description !== null) { $fields[] = 'description = :description'; $params[':description'] = $description; }
            if ($type !== null) { $fields[] = 'type = :type'; $params[':type'] = $type; }
            if ($status !== null) { $fields[] = 'status = :status'; $params[':status'] = $status; }

            $sql = 'UPDATE characteristics SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $this->jsonResponse(['status' => 'success', 'message' => 'Characteristic updated']);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = $_GET['id'] ?? $input['id'] ?? null;

        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID parameter is required'], 400);
            return;
        }

        try {
            $sql = 'DELETE FROM characteristics WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            $this->jsonResponse(['status' => 'success', 'message' => 'Characteristic deleted successfully']);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
