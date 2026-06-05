<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use App\Services\AiService;
use PDO;

class SuggestionController extends Controller
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * POST /suggestions
     * Soumettre une suggestion d'outil IA
     */
    public function submit()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'Authentication required'], 401);
            return;
        }

        // Récupérer les données
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        if (!$data) {
            $this->jsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
            return;
        }

        // Validation
        $errors = $this->validate($data);
        if (!empty($errors)) {
            $this->jsonResponse(['success' => false, 'errors' => $errors], 400);
            return;
        }

        try {
            $this->ensureSuggestionsTable();

            // Verifier les doublons
            $duplicateCheck = $this->checkDuplicate($data['name']);
            
            // Calculer le score (LLM ou Fallback Heuristiques)
            $aiResult = $this->evaluateSuggestion($data, $duplicateCheck);

            // Generer un ID
            $id = $this->generateUUID();

            $stmt = $this->db->prepare("
                INSERT INTO tool_suggestions 
                (id, name, description, website_url, logo_url, main_category_id, pricing_model, provider_name, submitted_by, ai_score, ai_feedback, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            ");

            $stmt->execute([
                $id,
                trim($data['name']),
                trim($data['description']),
                trim($data['website_url']),
                $data['logo_url'] ?? null,
                $data['main_category_id'] ?? null,
                $data['pricing_model'] ?? 'freemium',
                $data['provider_name'] ?? null,
                $userId,
                $aiResult['score'],
                $aiResult['feedback']
            ]);

            // Récupérer le paramètre d'auto-approbation
            $autoApproveStmt = $this->db->prepare("SELECT value FROM settings WHERE key_name = 'ai_auto_approval'");
            $autoApproveStmt->execute();
            $autoApprove = $autoApproveStmt->fetchColumn() === '1';

            $automaticallyApproved = false;
            $toolId = null;

            // Si auto-approbation active et score >= 70 et pas de doublon
            if ($autoApprove && $aiResult['score'] >= 70 && (!$duplicateCheck || !$duplicateCheck['exists'])) {
                $providerId = $this->getOrCreateProvider($data['provider_name']);
                $toolId = $this->createAiTool([
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'website_url' => $data['website_url'],
                    'logo_url' => $data['logo_url'] ?? null,
                    'pricing_model' => $data['pricing_model'] ?? 'freemium',
                    'main_category_id' => $data['main_category_id'] ?? null
                ], $providerId);

                // Mettre à jour le statut de la suggestion
                $updateStmt = $this->db->prepare("UPDATE tool_suggestions SET status = 'approved' WHERE id = ?");
                $updateStmt->execute([$id]);

                // Ajouter la notification
                $notifId = $this->generateUUID();
                $notifMsg = "Félicitations ! Votre suggestion d'outil '" . $data['name'] . "' a été automatiquement validée et publiée.";
                $link = "/discover/" . strtolower(str_replace(' ', '-', $data['name']));
                
                $nStmt = $this->db->prepare("
                    INSERT INTO notifications (id, user_id, message, link, status, created_at)
                    VALUES (?, ?, ?, ?, 'unread', NOW())
                ");
                $nStmt->execute([$notifId, $userId, $notifMsg, $link]);

                $automaticallyApproved = true;
            }

            $this->jsonResponse([
                'success' => true,
                'message' => $automaticallyApproved ? 'Suggestion approuvée automatiquement par l\'IA !' : 'Suggestion soumise avec succès et en attente de validation',
                'data' => [
                    'id' => $id,
                    'ai_score' => $aiResult['score'],
                    'ai_feedback' => $aiResult['feedback'],
                    'ai_details' => $aiResult['details'] ?? [],
                    'warnings' => $aiResult['warnings'] ?? [],
                    'red_flags' => $aiResult['red_flags'] ?? [],
                    'automatically_approved' => $automaticallyApproved,
                    'tool_id' => $toolId
                ]
            ], 201);

        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET /suggestions/pending
     * Recuperer les suggestions en attente (admin)
     */
    public function getPending()
    {
        $this->requireAdmin();
        try {
            $this->ensureSuggestionsTable();
            
            $stmt = $this->db->prepare("
                SELECT s.*, u.name as submitter_name, u.email as submitter_email, c.name as category_name
                FROM tool_suggestions s
                LEFT JOIN users u ON s.submitted_by = u.id
                LEFT JOIN categories c ON s.main_category_id = c.id
                WHERE s.status = 'pending'
                ORDER BY s.created_at DESC
            ");
            $stmt->execute();
            
            $this->jsonResponse([
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /suggestions/{id}/update
     * Modifier les suggestions (admin)
     */
    public function update($id)
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            $this->jsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
            return;
        }

        try {
            $this->ensureSuggestionsTable();

            $stmt = $this->db->prepare("
                UPDATE tool_suggestions
                SET name = ?, description = ?, website_url = ?, logo_url = ?, main_category_id = ?, pricing_model = ?, provider_name = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                trim($data['name']),
                trim($data['description']),
                trim($data['website_url']),
                $data['logo_url'] ?? null,
                $data['main_category_id'] ?? null,
                $data['pricing_model'] ?? 'freemium',
                $data['provider_name'] ?? null,
                $id
            ]);

            $this->jsonResponse([
                'success' => true,
                'message' => 'Suggestion mise à jour avec succès'
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /suggestions/{id}/approve
     * Approuver manuellement une suggestion
     */
    public function approve($id)
    {
        $this->requireAdmin();
        try {
            $this->ensureSuggestionsTable();
            
            $stmt = $this->db->prepare("SELECT * FROM tool_suggestions WHERE id = ?");
            $stmt->execute([$id]);
            $suggestion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$suggestion) {
                $this->jsonResponse(['success' => false, 'error' => 'Suggestion not found'], 404);
                return;
            }
            
            $providerId = $this->getOrCreateProvider($suggestion['provider_name']);
            $toolId = $this->createAiTool($suggestion, $providerId);
            
            $stmt = $this->db->prepare("UPDATE tool_suggestions SET status = 'approved' WHERE id = ?");
            $stmt->execute([$id]);

            // Notification pour le soumissionnaire
            if (!empty($suggestion['submitted_by'])) {
                $notifId = $this->generateUUID();
                $notifMsg = "Félicitations ! Votre suggestion d'outil '" . $suggestion['name'] . "' a été approuvée par l'administrateur.";
                $link = "/discover/" . strtolower(str_replace(' ', '-', $suggestion['name']));
                
                $nStmt = $this->db->prepare("
                    INSERT INTO notifications (id, user_id, message, link, status, created_at)
                    VALUES (?, ?, ?, ?, 'unread', NOW())
                ");
                $nStmt->execute([$notifId, $suggestion['submitted_by'], $notifMsg, $link]);
            }
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Outil approuvé et ajouté avec succès au catalogue',
                'data' => ['tool_id' => $toolId]
            ]);
            
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /suggestions/{id}/reject
     * Rejeter manuellement une suggestion
     */
    public function reject($id)
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $reason = $data['reason'] ?? 'Aucune raison fournie';
        
        try {
            $this->ensureSuggestionsTable();
            
            $stmt = $this->db->prepare("SELECT * FROM tool_suggestions WHERE id = ?");
            $stmt->execute([$id]);
            $suggestion = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$suggestion) {
                $this->jsonResponse(['success' => false, 'error' => 'Suggestion not found'], 404);
                return;
            }

            $stmt = $this->db->prepare("
                UPDATE tool_suggestions 
                SET status = 'rejected', admin_notes = ? 
                WHERE id = ?
            ");
            $stmt->execute([$reason, $id]);

            // Notification pour le soumissionnaire
            if (!empty($suggestion['submitted_by'])) {
                $notifId = $this->generateUUID();
                $notifMsg = "Votre suggestion d'outil '" . $suggestion['name'] . "' a été refusée par l'administrateur. Raison : " . $reason;
                
                $nStmt = $this->db->prepare("
                    INSERT INTO notifications (id, user_id, message, status, created_at)
                    VALUES (?, ?, ?, 'unread', NOW())
                ");
                $nStmt->execute([$notifId, $suggestion['submitted_by'], $notifMsg]);
            }
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Suggestion rejetée'
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /admin/settings
     */
    public function getSettings()
    {
        $this->requireAdmin();
        try {
            $this->ensureSuggestionsTable();
            $stmt = $this->db->prepare("SELECT value FROM settings WHERE key_name = 'ai_auto_approval'");
            $stmt->execute();
            $val = $stmt->fetchColumn();
            
            $this->jsonResponse([
                'success' => true,
                'ai_auto_approval' => $val === '1'
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /admin/settings
     */
    public function updateSettings()
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $value = isset($data['ai_auto_approval']) ? ($data['ai_auto_approval'] ? '1' : '0') : '0';
        
        try {
            $this->ensureSuggestionsTable();
            $stmt = $this->db->prepare("UPDATE settings SET value = ? WHERE key_name = 'ai_auto_approval'");
            $stmt->execute([$value]);
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Settings updated successfully',
                'ai_auto_approval' => $value === '1'
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==================== METHODES INTERNES ====================

    private function validate($data)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Le nom est requis';
        }
        if (empty($data['description'])) {
            $errors['description'] = 'La description est requise';
        }
        if (empty($data['website_url'])) {
            $errors['website_url'] = "L'URL du site est requise";
        }
        if (empty($data['main_category_id'])) {
            $errors['main_category_id'] = 'La catégorie est requise';
        }

        return $errors;
    }

    /**
     * Verifier si l'outil existe deja
     */
    private function checkDuplicate($name)
    {
        try {
            $stmt = $this->db->prepare("SELECT id, name FROM ai_tools WHERE LOWER(name) = ?");
            $stmt->execute([strtolower(trim($name))]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existing) {
                return [
                    'exists' => true,
                    'id' => $existing['id'],
                    'name' => $existing['name'],
                    'source' => 'catalogue'
                ];
            }
            
            $stmt = $this->db->prepare("SELECT id, name FROM tool_suggestions WHERE LOWER(name) = ? AND status = 'pending'");
            $stmt->execute([strtolower(trim($name))]);
            $pending = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($pending) {
                return [
                    'exists' => true,
                    'id' => $pending['id'],
                    'name' => $pending['name'],
                    'source' => 'pending'
                ];
            }
            
            return ['exists' => false];
            
        } catch (\PDOException $e) {
            return ['exists' => false];
        }
    }

    /**
     * Évaluer la suggestion (LLM ou Fallback)
     */
    private function evaluateSuggestion($toolData, $duplicateCheck)
    {
        if ($duplicateCheck && $duplicateCheck['exists']) {
            $source = $duplicateCheck['source'] === 'catalogue' ? 'catalogue' : 'suggestions en attente';
            return [
                'score' => 0,
                'feedback' => "DOUBLON: Cet outil est déjà présent dans le " . $source . " (" . $duplicateCheck['name'] . ").",
                'details' => [],
                'warnings' => ["Outil déjà existant"],
                'red_flags' => ["DOUBLON"]
            ];
        }

        // Récupérer le nom de la catégorie pour le prompt
        $categoryName = "Inconnue";
        if (!empty($toolData['main_category_id'])) {
            $stmt = $this->db->prepare("SELECT name FROM categories WHERE id = ?");
            $stmt->execute([$toolData['main_category_id']]);
            $categoryName = $stmt->fetchColumn() ?: "Inconnue";
        }

        $prompt = "Évalue l'outil IA suivant sur une échelle de 0 à 100:
        Nom: {$toolData['name']}
        Description: {$toolData['description']}
        Catégorie suggérée: {$categoryName}
        Site web: {$toolData['website_url']}
        Créateur: " . ($toolData['provider_name'] ?? 'Non spécifié') . "
        Tarification: {$toolData['pricing_model']}";

        $systemInstruction = "Tu es un expert en évaluation d'outils d'intelligence artificielle.
        Analyse l'outil et renvoie STRICTEMENT un objet JSON contenant les clés :
        - 'score' : nombre de 0 à 100
        - 'feedback' : court paragraphe explicatif en français
        - 'details' : un objet contenant les notes pour :
            * 'description_quality' (sur 20)
            * 'category_relevance' (sur 15)
            * 'credibility' (sur 15)
            * 'innovation' (sur 20)
            * 'usefulness' (sur 30)
        Le JSON doit être propre, sans format markdown ```json, juste l'objet brut.";

        $aiResponse = AiService::generateText($prompt, $systemInstruction);

        if ($aiResponse) {
            // Nettoyage de la réponse si enveloppée par du markdown
            $cleanResponse = preg_replace('/```json|```/', '', $aiResponse);
            $cleanResponse = trim($cleanResponse);
            $parsed = json_decode($cleanResponse, true);

            if ($parsed && isset($parsed['score'])) {
                return [
                    'score' => min(max((int)$parsed['score'], 0), 100),
                    'feedback' => $parsed['feedback'] ?? "Outil évalué par l'IA.",
                    'details' => $parsed['details'] ?? []
                ];
            }
        }

        // Fallback Heuristiques de Youssef
        return $this->fallbackScoring($toolData);
    }

    /**
     * Fallback Heuristiques
     */
    private function fallbackScoring($data)
    {
        $score = 0;
        $details = [];
        $feedbackList = [];
        $warnings = [];
        $redFlags = [];

        $descLength = strlen($data['description'] ?? '');
        if ($descLength >= 300) {
            $score += 30;
            $details['description_quality'] = 20;
            $feedbackList[] = "Description excellente (plus de 300 caractères)";
        } elseif ($descLength >= 100) {
            $score += 20;
            $details['description_quality'] = 15;
            $feedbackList[] = "Description correcte (plus de 100 caractères)";
        } else {
            $score += 5;
            $details['description_quality'] = 5;
            $feedbackList[] = "Description trop courte";
        }

        if (!empty($data['website_url']) && filter_var($data['website_url'], FILTER_VALIDATE_URL)) {
            $score += 15;
            $details['credibility'] = 10;
            if (strpos($data['website_url'], 'https://') === 0) {
                $score += 10;
                $details['credibility'] += 5;
                $feedbackList[] = "Site sécurisé (HTTPS)";
            } else {
                $warnings[] = "URL non sécurisée (HTTP)";
            }
        } else {
            $redFlags[] = "URL invalide";
        }

        if (!empty($data['main_category_id'])) {
            $score += 15;
            $details['category_relevance'] = 15;
        } else {
            $redFlags[] = "Catégorie non spécifiée";
        }

        if (!empty($data['provider_name'])) {
            $score += 15;
            $details['credibility'] = ($details['credibility'] ?? 0) + 10;
            $feedbackList[] = "Créateur identifié";
        }

        $pricing = $data['pricing_model'] ?? 'unknown';
        if ($pricing === 'free') {
            $score += 15;
            $details['usefulness'] = 20;
        } elseif ($pricing === 'freemium') {
            $score += 12;
            $details['usefulness'] = 18;
        } else {
            $score += 5;
            $details['usefulness'] = 10;
        }

        $score = min(max($score, 0), 100);

        $feedback = "Validation heuristique de secours. " . implode(". ", $feedbackList);

        return [
            'score' => $score,
            'feedback' => $feedback,
            'details' => $details,
            'warnings' => $warnings,
            'red_flags' => $redFlags
        ];
    }

    /**
     * Creer ou recuperer un provider
     */
    private function getOrCreateProvider($name)
    {
        if (empty($name)) {
            // Provider par défaut "Communauté"
            $name = "Communauté";
        }
        
        $stmt = $this->db->prepare("SELECT id FROM providers WHERE LOWER(name) = ?");
        $stmt->execute([strtolower(trim($name))]);
        $provider = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($provider) {
            return $provider['id'];
        }
        
        $id = $this->generateUUID();
        $stmt = $this->db->prepare("INSERT INTO providers (id, name, status) VALUES (?, ?, 'active')");
        $stmt->execute([$id, trim($name)]);
        
        return $id;
    }

    /**
     * Creer un AI tool
     */
    private function createAiTool($suggestion, $providerId)
    {
        $id = $this->generateUUID();
        
        $stmt = $this->db->prepare("
            INSERT INTO ai_tools 
            (id, name, description, website_url, logo_url, provider_id, pricing_model, status, main_category_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, NOW())
        ");
        
        $stmt->execute([
            $id,
            trim($suggestion['name']),
            trim($suggestion['description']),
            trim($suggestion['website_url']),
            $suggestion['logo_url'] ?? null,
            $providerId,
            $suggestion['pricing_model'] ?? 'freemium',
            $suggestion['main_category_id']
        ]);
        
        return $id;
    }

    /**
     * Creer la table suggestions et settings si elles n'existent pas
     */
    private function ensureSuggestionsTable()
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS tool_suggestions (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                website_url VARCHAR(500),
                logo_url VARCHAR(500),
                main_category_id VARCHAR(50),
                pricing_model VARCHAR(20) DEFAULT 'unknown',
                provider_name VARCHAR(255),
                submitted_by VARCHAR(50),
                ai_score INT DEFAULT NULL,
                ai_feedback TEXT,
                admin_notes TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS settings (
                key_name VARCHAR(100) PRIMARY KEY,
                value VARCHAR(255) NOT NULL
            );
        ";
        $this->db->exec($sql);
        
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM settings WHERE key_name = 'ai_auto_approval'");
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) {
            $stmt = $this->db->prepare("INSERT INTO settings (key_name, value) VALUES ('ai_auto_approval', '0')");
            $stmt->execute();
        }
    }

    /**
     * Generer un UUID via SQL
     */
    private function generateUUID()
    {
        $stmt = $this->db->query("SELECT UUID() as uuid");
        return $stmt->fetchColumn();
    }
}
