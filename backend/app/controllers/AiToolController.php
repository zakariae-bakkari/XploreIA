<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

class AiToolController extends Controller
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Fetch all AI tools with their category, characteristics, and models
     */
    public function index()
    {
        try {
            // Fetch AI tools with category info
            $query = "
                SELECT 
                    t.id, t.name, t.description, t.logo_url, t.global_rating, t.website_url, t.release_date, t.pricing_model,
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
    public function getFilters()
    {
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

            // Récupérer les avis (Reviews)
            $reviewStmt = $db->prepare("
            SELECT r.id, r.comment, r.rating, r.created_at, u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.tool_id = ? AND r.status = 'approved'
            ORDER BY r.created_at DESC
        ");
            $reviewStmt->execute([$id]);
            $tool['reviews'] = $reviewStmt->fetchAll();

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

    public function getFeatured()
    {
        try {
            $query = "SELECT *
                            FROM ai_tools
                            WHERE status = 'published'
                            AND global_rating >= 4.5
                            ORDER BY global_rating DESC, created_at DESC
                            LIMIT 10;";
            $stm = $this->db->prepare($query);
            $stm->execute();
            $tools = $stm->fetchAll(PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'status' => 'success',
                'data' => $tools
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);

        }
    }

    /**
     * POST /ai-tools/suggest
     * Suggest a new AI Tool with automatic AI validation
     */
    public function suggest()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Authentication required'], 401);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $name = trim($data['name'] ?? '');
        $description = trim($data['description'] ?? '');
        $websiteUrl = trim($data['website_url'] ?? '');
        $categoryId = empty($data['main_category_id']) ? null : $data['main_category_id'];
        $pricingModel = trim($data['pricing_model'] ?? 'freemium');

        if (empty($name)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);
            return;
        }

        try {
            // Check if tool name already exists
            $check = $this->db->prepare("SELECT id FROM ai_tools WHERE LOWER(name) = ?");
            $check->execute([strtolower($name)]);
            if ($check->fetch()) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Un outil avec ce nom existe déjà.'], 409);
                return;
            }

            // AI Validation Prompt
            $prompt = "Validate the following suggested AI tool:\nName: $name\nDescription: $description\nURL: $websiteUrl\nPricing: $pricingModel";
            $systemInstruction = "You are a tool validation assistant. Check if the tool named '$name' is a legitimate AI tool or product.
Return a JSON object in this exact format:
{
  \"valid\": true/false,
  \"name\": \"Corrected Name if typo\",
  \"description\": \"Professional 2-sentence description\",
  \"pricing_model\": \"free/freemium/premium\",
  \"reason\": \"Brief explanation of your decision\"
}
Do NOT include any extra formatting, markdown wraps, or explanations. Only return valid JSON.";

            $aiResponse = \App\Services\AiService::generateText($prompt, $systemInstruction);
            
            // Clean AI response to handle Markdown json blocks if returned
            $cleanResponse = preg_replace('/```json|```/', '', $aiResponse);
            $validation = json_decode(trim($cleanResponse), true);

            // Defaults if AI response is invalid
            if (!$validation || !isset($validation['valid'])) {
                $validation = [
                    'valid' => true,
                    'name' => $name,
                    'description' => $description ?: "Outil suggéré par la communauté.",
                    'pricing_model' => $pricingModel,
                    'reason' => "Validé par défaut."
                ];
            }

            $isValid = (bool)$validation['valid'];
            $finalName = trim($validation['name'] ?? $name);
            $finalDesc = trim($validation['description'] ?? $description);
            $finalPricing = trim($validation['pricing_model'] ?? $pricingModel);
            $reason = trim($validation['reason'] ?? '');

            // Create tool entry
            $toolId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            $status = $isValid ? 'published' : 'rejected';
            $validatedBy = $isValid ? '00000000-0000-0000-0000-000000000001' : null; // Validate by Admin seed ID

            $stmt = $this->db->prepare("
                INSERT INTO ai_tools (id, name, description, website_url, pricing_model, status, main_category_id, created_by, validated_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$toolId, $finalName, $finalDesc, $websiteUrl, $finalPricing, $status, $categoryId, $userId, $validatedBy]);

            // Save Notification for User
            $notifId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            $notifMsg = $isValid 
                ? "Félicitations ! Votre suggestion d'outil '" . $finalName . "' a été automatiquement validée par l'IA et publiée." 
                : "Votre suggestion d'outil '" . $name . "' a été refusée par l'IA de modération. Raison : " . $reason;

            $nStmt = $this->db->prepare("
                INSERT INTO notifications (id, user_id, message, link, status, created_at)
                VALUES (?, ?, ?, ?, 'unread', NOW())
            ");
            // Set link to slugified path if published
            $link = $isValid ? "/discover/" . strtolower(str_replace(' ', '-', $finalName)) : null;
            $nStmt->execute([$notifId, $userId, $notifMsg, $link]);

            $this->jsonResponse([
                'status' => 'success',
                'valid' => $isValid,
                'message' => $notifMsg,
                'data' => [
                    'id' => $toolId,
                    'name' => $finalName,
                    'status' => $status
                ]
            ], 201);

        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
