<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use App\Services\AiService;
use PDO;

class AiController extends Controller
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * POST /ai/chat
     * AI Recommendation Chatbot
     */
    public function chat()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $message = trim($data['message'] ?? '');

        if (empty($message)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Message is required'], 400);
            return;
        }

        try {
            // Load all published AI tools to pass as context
            $query = "
                SELECT t.name, t.description, t.pricing_model, t.global_rating, c.name as category_name
                FROM ai_tools t
                LEFT JOIN categories c ON t.main_category_id = c.id
                WHERE t.status = 'published'
            ";
            $stmt = $this->db->query($query);
            $tools = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format prompt
            $toolsJson = json_encode($tools);
            
            $systemInstruction = "You are XploreIA Assistant, a friendly and expert chatbot helping users discover the best AI tools from our database.
Here is the official list of AI tools available in our database:
$toolsJson

Your goal is to recommend the most relevant tools from our database based on the user's requirements.
Guidelines:
1. Always prioritize recommending tools that exist in our database. Link them using Markdown like this: **[Tool Name](discover/slug)** (convert spaces to hyphens and lowercase).
2. If the user asks for a tool not in our database, you may briefly mention external tools but encourage exploring our tools.
3. Keep your response concise, friendly, and structured in Markdown format.
4. If you don't find a matching tool in our database, recommend general alternatives from our categories.
Answer in the same language as the user's message.";

            // Run AI completion
            $reply = AiService::generateText($message, $systemInstruction);

            if ($reply === null) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Le service IA n\'est pas disponible pour le moment.'
                ], 503);
                return;
            }

            $this->jsonResponse([
                'status' => 'success',
                'reply' => $reply
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
