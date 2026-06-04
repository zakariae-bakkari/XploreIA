<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use Exception;
use PDO;

class AdminCategorieController extends Controller
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
         $query = 'SELECT id, name, description, status, created_at, updated_at FROM categories';
         $stmt = $this->db->prepare($query);
         $stmt->execute();
         $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

         $this->jsonResponse([
            'status' => 'success',
            'data' => $categories
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
         $sql = 'SELECT id, name, description, status, created_at, updated_at FROM categories WHERE id = :id';
         $stmt = $this->db->prepare($sql);
         $stmt->execute([':id' => $id]);
         $cat = $stmt->fetch(PDO::FETCH_ASSOC);

         if (!$cat) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Category not found'], 404);
            return;
         }

         $this->jsonResponse(['status' => 'success', 'data' => $cat]);
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

        if (empty($name)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);
            return;
        }

        try {
            // Check duplicate case-insensitive
            $checkStmt = $this->db->prepare('SELECT COUNT(*) as count FROM categories WHERE name = :name');
            $checkStmt->execute([':name' => $name]);
            $count = (int)$checkStmt->fetch(PDO::FETCH_ASSOC)['count'];
            if ($count > 0) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Category already exists'], 400);
                return;
            }

            $sql = 'INSERT INTO categories (name, description, status, created_at) VALUES (:name, :description, :status, NOW())';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':name' => $name, ':description' => $description, ':status' => 'active']);
            $id = $this->db->lastInsertId();

            $this->jsonResponse(['status' => 'success', 'message' => 'Category created', 'id' => $id], 201);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function update($id = null)
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $name = array_key_exists('name', $data) ? trim($data['name']) : null;
        $description = array_key_exists('description', $data) ? $data['description'] : null;

        $id = $id ?? ($_GET['id'] ?? ($data['id'] ?? null));
        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID is required'], 400);
            return;
        }

        if ($name === null && $description === null) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Nothing to update'], 400);
            return;
        }

        try {
            if ($name !== null) {
                // Check duplicate on other categories
                $checkStmt = $this->db->prepare('SELECT COUNT(*) as count FROM categories WHERE name = :name AND id != :id');
                $checkStmt->execute([':name' => $name, ':id' => $id]);
                $count = (int)$checkStmt->fetch(PDO::FETCH_ASSOC)['count'];
                if ($count > 0) {
                    $this->jsonResponse(['status' => 'error', 'message' => 'Category name already exists'], 400);
                    return;
                }
            }

            $fields = [];
            $params = [':id' => $id];
            if ($name !== null) { $fields[] = 'name = :name'; $params[':name'] = $name; }
            if ($description !== null) { $fields[] = 'description = :description'; $params[':description'] = $description; }
            $fields[] = 'updated_at = NOW()';

            $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $this->jsonResponse(['status' => 'success', 'message' => 'Category updated']);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = $_GET['id'] ?? $input['id'] ?? null;
        $force = isset($_GET['force']) ? ($_GET['force'] === '1' || $_GET['force'] === 'true') : (isset($input['force']) && ($input['force'] === true || $input['force'] === '1' || $input['force'] === 'true'));
        $replacementId = $input['replacement_id'] ?? $_GET['replacement_id'] ?? null;

        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'ID parameter is required'], 400);
            return;
        }

        try {
            $checkStmt = $this->db->prepare('SELECT COUNT(*) as cnt FROM ai_tools WHERE main_category_id = :id');
            $checkStmt->execute([':id' => $id]);
            $cnt = (int)$checkStmt->fetch(PDO::FETCH_ASSOC)['cnt'];

            if ($cnt > 0 && !$force && !$replacementId) {
                $this->jsonResponse([
                    'status' => 'error',
                    'code' => 'in_use',
                    'count' => $cnt,
                    'message' => "Category is used by $cnt tool(s). Select a replacement category or detach them."
                ], 409);
                return;
            }

            $this->db->beginTransaction();
            if ($cnt > 0) {
                if ($replacementId) {
                    $updTools = $this->db->prepare('UPDATE ai_tools SET main_category_id = :replacement_id WHERE main_category_id = :id');
                    $updTools->execute([':replacement_id' => $replacementId, ':id' => $id]);
                } else if ($force) {
                    $updTools = $this->db->prepare('UPDATE ai_tools SET main_category_id = NULL WHERE main_category_id = :id');
                    $updTools->execute([':id' => $id]);
                }
            }

            $sql = 'DELETE FROM categories WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            $this->db->commit();

            $this->jsonResponse(['status' => 'success', 'message' => "Category with id $id was deleted permanently"]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
