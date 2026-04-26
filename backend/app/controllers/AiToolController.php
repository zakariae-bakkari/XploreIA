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

    public function show()
{
    // Récupère l'ID depuis le paramètre GET
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        $this->jsonResponse([
            'success' => false,
            'error' => 'ID parameter is required'
        ], 400);
        return;
    }
    
    try {
        // CORRECTION ICI - Utilise getInstance
        $db = Database::getInstance()->getConnection();
        
        $sql = "
            SELECT 
                t.id,
                t.name,
                t.description,
                t.logo_url,
                t.global_rating,
                t.website_url,
                t.release_date,
                t.pricing_model,
                c.name as category_name,
                p.name as provider_name
            FROM ai_tools t
            LEFT JOIN categories c ON t.main_category_id = c.id
            LEFT JOIN providers p ON t.provider_id = p.id
            WHERE t.id = :id
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $tool = $stmt->fetch();
        
        if (!$tool) {
            $this->jsonResponse([
                'success' => false,
                'error' => 'Tool not found'
            ], 404);
            return;
        }
        
        // Récupérer les avantages
        $advStmt = $db->prepare("SELECT advantage_name as name FROM advantages WHERE tool_id = ?");
        $advStmt->execute([$id]);
        $tool['advantages'] = $advStmt->fetchAll();
        
        // Récupérer les inconvénients
        $disStmt = $db->prepare("SELECT disadvantage_name as name FROM disadvantages WHERE tool_id = ?");
        $disStmt->execute([$id]);
        $tool['disadvantages'] = $disStmt->fetchAll();
        
        // Récupérer les caractéristiques
        $charStmt = $db->prepare("
            SELECT c.name 
            FROM tool_characteristics tc
            JOIN characteristics c ON tc.characteristic_id = c.id
            WHERE tc.tool_id = ?
        ");
        $charStmt->execute([$id]);
        $tool['characteristics'] = $charStmt->fetchAll();
        
        // Récupérer les modèles
        $modelStmt = $db->prepare("
            SELECT m.name, m.description
            FROM tool_models tm
            JOIN models m ON tm.model_id = m.id
            WHERE tm.tool_id = ?
        ");
        $modelStmt->execute([$id]);
        $tool['models'] = $modelStmt->fetchAll();
        
        // Récupérer les plans tarifaires
        $priceStmt = $db->prepare("
            SELECT plan_name, pricing_type, price_month, price_year
            FROM pricing_plans
            WHERE tool_id = ?
        ");
        $priceStmt->execute([$id]);
        $tool['pricing_plans'] = $priceStmt->fetchAll();
        
        $this->jsonResponse([
            'success' => true,
            'data' => $tool
        ]);
        
    } catch (\PDOException $e) {
        $this->jsonResponse([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ], 500);
    }
}
    
}
