<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use Exception;
use PDO;

class AdminReviewController extends Controller
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index()
    {
        $this->requireAdmin();
        $toolId = $_GET['tool_id'] ?? null;

        try {
            $query = 'SELECT r.id, r.rating, r.comment, r.status, r.created_at, 
                      u.id as user_id, u.name as user_name, u.email as user_email, u.status as user_status,
                      t.name as tool_name, t.id as tool_id
                      FROM reviews r
                      JOIN users u ON r.user_id = u.id
                      JOIN ai_tools t ON r.tool_id = t.id';

            $params = [];
            if ($toolId) {
                $query .= ' WHERE r.tool_id = :tool_id';
                $params[':tool_id'] = $toolId;
            }

            $query .= ' ORDER BY r.created_at DESC';
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'status' => 'success',
                'data' => $reviews
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function approve()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = $input['id'] ?? $_GET['id'] ?? null;

        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Review ID required'], 400);
            return;
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare('UPDATE reviews SET status = "approved" WHERE id = :id');
            $stmt->execute([':id' => $id]);

            // Retrieve tool_id before updating rating
            $stmtTool = $this->db->prepare('SELECT tool_id FROM reviews WHERE id = :id');
            $stmtTool->execute([':id' => $id]);
            $toolId = $stmtTool->fetchColumn();

            if ($toolId) {
                // Update tool global rating
                $upd = $this->db->prepare('UPDATE ai_tools SET global_rating = (SELECT AVG(rating) FROM reviews WHERE tool_id = :reviews_tool_id AND status = "approved") WHERE id = :tools_id');
                $upd->execute([':reviews_tool_id' => $toolId, ':tools_id' => $toolId]);
            }

            $this->db->commit();

            $this->jsonResponse(['status' => 'success', 'message' => 'Review approved successfully']);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = $input['id'] ?? $_GET['id'] ?? null;

        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Review ID required'], 400);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Retrieve tool_id before deletion to recalculate rating
            $stmt = $this->db->prepare('SELECT tool_id FROM reviews WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $toolId = $stmt->fetchColumn();

            // Delete review
            $del = $this->db->prepare('DELETE FROM reviews WHERE id = :id');
            $del->execute([':id' => $id]);

            if ($toolId) {
                // Update tool global rating
                $upd = $this->db->prepare('UPDATE ai_tools SET global_rating = (SELECT AVG(rating) FROM reviews WHERE tool_id = :reviews_tool_id AND status = "approved") WHERE id = :tools_id');
                $upd->execute([':reviews_tool_id' => $toolId, ':tools_id' => $toolId]);
            }

            $this->db->commit();

            $this->jsonResponse(['status' => 'success', 'message' => 'Review deleted successfully']);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function suspendUser()
    {
        $this->requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = $input['user_id'] ?? $_GET['user_id'] ?? null;

        if (!$userId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'User ID required'], 400);
            return;
        }

        try {
            $stmt = $this->db->prepare('UPDATE users SET status = "banned" WHERE id = :id');
            $stmt->execute([':id' => $userId]);

            $this->jsonResponse(['status' => 'success', 'message' => 'User suspended successfully']);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
