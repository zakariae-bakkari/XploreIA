<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

class AiToolController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Fetch all AI tools with their category, characteristics, and models
     */
    public function index() {
        try {
            // Fetch AI tools with category info
            $query = "
                SELECT 
                    t.id, t.name, t.description, t.logo_url, t.global_rating, t.website_url, t.release_date,
                    c.name as category_name,
                    p.name as provider_name
                FROM ai_tools t
                LEFT JOIN categories c ON t.main_category_id = c.id
                LEFT JOIN providers p ON t.provider_id = p.id
                WHERE t.status = 'published'
                ORDER BY t.global_rating DESC
            ";
            
            $stmt = $this->db->query($query);
            $tools = $stmt->fetchAll();

            // For each tool, fetch its characteristics
            foreach ($tools as &$tool) {
                $charQuery = "
                    SELECT c.name, c.type
                    FROM characteristics c
                    JOIN tool_characteristics tc ON c.id = tc.characteristic_id
                    WHERE tc.tool_id = :tool_id
                ";
                $charStmt = $this->db->prepare($charQuery);
                $charStmt->execute(['tool_id' => $tool['id']]);
                $tool['characteristics'] = $charStmt->fetchAll();

                // Fetch models
                $modelQuery = "
                    SELECT m.name, m.description
                    FROM models m
                    JOIN tool_models tm ON m.id = tm.model_id
                    WHERE tm.tool_id = :tool_id
                ";
                $modelStmt = $this->db->prepare($modelQuery);
                $modelStmt->execute(['tool_id' => $tool['id']]);
                $tool['models'] = $modelStmt->fetchAll();
            }

            $this->jsonResponse([
                'status' => 'success',
                'data' => $tools
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch all categories and characteristics for filtering
     */
    public function getFilters() {
        try {
            $categories = $this->db->query("SELECT id, name FROM categories")->fetchAll();
            $characteristics = $this->db->query("SELECT DISTINCT name, type FROM characteristics WHERE status = 'active'")->fetchAll();

            $this->jsonResponse([
                'status' => 'success',
                'data' => [
                    'categories' => $categories,
                    'characteristics' => $characteristics
                ]
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
