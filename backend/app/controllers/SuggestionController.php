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
            if ($duplicateCheck && $duplicateCheck['exists']) {
                $source = $duplicateCheck['source'] === 'catalogue' ? 'présent dans le catalogue' : 'déjà suggéré';
                $this->jsonResponse([
                    'success' => false,
                    'error' => "Doublon : Cet outil est déjà " . $source
                ], 400);
                return;
            }
            
            // Calculer le score (LLM ou Fallback Heuristiques)
            $aiResult = $this->evaluateSuggestion($data, $duplicateCheck);

            // Bloquer si le score est inférieur à 40 (l'outil n'existe pas sur le marché ou est suspect/frauduleux)
            if ($aiResult['score'] < 40) {
                $this->jsonResponse([
                    'success' => false,
                    'error' => "Cette suggestion a été rejetée car l'outil n'a pas été validé par l'IA (Score: " . $aiResult['score'] . "/100). " . $aiResult['feedback'],
                    'data' => [
                        'ai_score' => $aiResult['score'],
                        'ai_feedback' => $aiResult['feedback'],
                        'ai_details' => $aiResult['details'] ?? []
                    ]
                ], 400);
                return;
            }

            // Generer un ID
            $id = $this->generateUUID();

            $stmt = $this->db->prepare("
                INSERT INTO tool_suggestions 
                (id, name, description, website_url, logo_url, main_category_id, pricing_model, provider_name, submitted_by, 
                 ai_score, ai_feedback, model_ids, characteristic_ids, advantages, disadvantages, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
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
                $aiResult['feedback'],
                json_encode($data['model_ids'] ?? []),
                json_encode($data['characteristic_ids'] ?? []),
                json_encode($data['advantages'] ?? []),
                json_encode($data['disadvantages'] ?? [])
            ]);

            // Récupérer le paramètre d'auto-approbation
            $autoApproveStmt = $this->db->prepare("SELECT value FROM settings WHERE key_name = 'ai_auto_approval'");
            $autoApproveStmt->execute();
            $autoApprove = (int)$autoApproveStmt->fetchColumn() === 1;

            $automaticallyApproved = false;
            $toolId = null;

            // Si auto-approbation active et score >= 75
            if ($autoApprove && $aiResult['score'] >= 75) {
                $providerId = $this->getOrCreateProvider($data['provider_name'] ?? null);
                $toolId = $this->createAiTool([
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'website_url' => $data['website_url'],
                    'logo_url' => $data['logo_url'] ?? null,
                    'pricing_model' => $data['pricing_model'] ?? 'freemium',
                    'main_category_id' => $data['main_category_id'] ?? null
                ], $providerId);

                // Lier les relations (modèles, caractéristiques, avantages, inconvénients)
                $this->insertToolRelations($toolId, $data, $userId);

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
     * POST /suggestions/update
     * Modifier les suggestions (admin)
     */
    public function update()
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            $this->jsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
            return;
        }

        $id = $data['id'] ?? null;
        if (!$id) {
            $this->jsonResponse(['success' => false, 'error' => 'ID is required'], 400);
            return;
        }

        try {
            $this->ensureSuggestionsTable();

            $stmt = $this->db->prepare("
                UPDATE tool_suggestions
                SET name = ?, description = ?, website_url = ?, logo_url = ?, main_category_id = ?, pricing_model = ?, provider_name = ?, 
                    model_ids = ?, characteristic_ids = ?, advantages = ?, disadvantages = ?, updated_at = NOW()
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
                json_encode($data['model_ids'] ?? []),
                json_encode($data['characteristic_ids'] ?? []),
                json_encode($data['advantages'] ?? []),
                json_encode($data['disadvantages'] ?? []),
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
     * POST /suggestions/approve
     * Approuver manuellement une suggestion
     */
    public function approve()
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        if (!$id) {
            $this->jsonResponse(['success' => false, 'error' => 'ID is required'], 400);
            return;
        }

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
            
            // Lier les relations
            $this->insertToolRelations($toolId, $suggestion, $suggestion['submitted_by']);

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
     * POST /suggestions/reject
     * Rejeter manuellement une suggestion
     */
    public function reject()
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        if (!$id) {
            $this->jsonResponse(['success' => false, 'error' => 'ID is required'], 400);
            return;
        }
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
                'ai_auto_approval' => (int)$val === 1
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
            
            $countApproved = 0;
            // Si on active l'auto-publication (value == 1), on approuve rétroactivement les suggestions en attente avec score >= 75
            if ($value === '1') {
                $stmt = $this->db->prepare("SELECT * FROM tool_suggestions WHERE status = 'pending' AND ai_score >= 75");
                $stmt->execute();
                $pendingToApprove = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                
                foreach ($pendingToApprove as $suggestion) {
                    $providerId = $this->getOrCreateProvider($suggestion['provider_name']);
                    $toolId = $this->createAiTool($suggestion, $providerId);
                    
                    // Lier les relations
                    $this->insertToolRelations($toolId, $suggestion, $suggestion['submitted_by']);

                    // Marquer comme approuvée
                    $upd = $this->db->prepare("UPDATE tool_suggestions SET status = 'approved' WHERE id = ?");
                    $upd->execute([$suggestion['id']]);

                    // Notification pour le soumissionnaire
                    if (!empty($suggestion['submitted_by'])) {
                        $notifId = $this->generateUUID();
                        $notifMsg = "Félicitations ! Votre suggestion d'outil '" . $suggestion['name'] . "' a été automatiquement validée et publiée.";
                        $link = "/discover/" . strtolower(str_replace(' ', '-', $suggestion['name']));
                        
                        $nStmt = $this->db->prepare("
                            INSERT INTO notifications (id, user_id, message, link, status, created_at)
                            VALUES (?, ?, ?, ?, 'unread', NOW())
                        ");
                        $nStmt->execute([$notifId, $suggestion['submitted_by'], $notifMsg, $link]);
                    }
                    $countApproved++;
                }
            }
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Settings updated successfully',
                'ai_auto_approval' => (int)$value === 1,
                'retroactive_approved_count' => $countApproved
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
     * GET /suggestions/form-data
     * Récupérer les catégories, caractéristiques et modèles pour le formulaire de suggestion
     */
    public function getFormData()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'Authentication required'], 401);
            return;
        }

        try {
            // Catégories actives
            $catStmt = $this->db->query("SELECT id, name FROM categories WHERE status = 'active' ORDER BY name ASC");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // Caractéristiques actives
            $charStmt = $this->db->query("SELECT id, name, type FROM characteristics WHERE status = 'active' ORDER BY name ASC");
            $characteristics = $charStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // Modèles actifs
            $modelStmt = $this->db->query("SELECT id, name FROM models WHERE status = 'active' ORDER BY name ASC");
            $models = $modelStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            $this->jsonResponse([
                'success' => true,
                'data' => [
                    'categories' => $categories,
                    'characteristics' => $characteristics,
                    'models' => $models
                ]
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Évaluer la suggestion en appelant le service IA
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

        // Récupérer les noms des modèles sélectionnés
        $modelNames = [];
        $modelIds = $toolData['model_ids'] ?? [];
        if (!empty($modelIds) && is_array($modelIds)) {
            $placeholders = implode(',', array_fill(0, count($modelIds), '?'));
            $mStmt = $this->db->prepare("SELECT name FROM models WHERE id IN ($placeholders)");
            $mStmt->execute($modelIds);
            $modelNames = $mStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
        }

        // Récupérer les noms des caractéristiques sélectionnées
        $characteristicNames = [];
        $charIds = $toolData['characteristic_ids'] ?? [];
        if (!empty($charIds) && is_array($charIds)) {
            $placeholders = implode(',', array_fill(0, count($charIds), '?'));
            $cStmt = $this->db->prepare("SELECT name FROM characteristics WHERE id IN ($placeholders)");
            $cStmt->execute($charIds);
            $characteristicNames = $cStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
        }

        $evaluationData = [
            'name' => $toolData['name'],
            'description' => $toolData['description'],
            'category_name' => $categoryName,
            'website_url' => $toolData['website_url'],
            'logo_url' => $toolData['logo_url'] ?? '',
            'provider_name' => $toolData['provider_name'] ?? '',
            'pricing_model' => $toolData['pricing_model'] ?? 'freemium',
            'models' => $modelNames,
            'characteristics' => $characteristicNames,
            'advantages' => $toolData['advantages'] ?? [],
            'disadvantages' => $toolData['disadvantages'] ?? [],
        ];

        // Évaluation via AiService
        return AiService::evaluateTool($evaluationData);
    }

    /**
     * Lier les relations d'un outil approuvé
     */
    private function insertToolRelations($toolId, $data, $submittedBy)
    {
        // 1. Models
        $modelIds = is_string($data['model_ids'] ?? null) ? json_decode($data['model_ids'], true) : ($data['model_ids'] ?? []);
        if (!empty($modelIds) && is_array($modelIds)) {
            $mStmt = $this->db->prepare("INSERT IGNORE INTO tool_models (id, tool_id, model_id) VALUES (UUID(), ?, ?)");
            foreach ($modelIds as $modelId) {
                if (!empty($modelId)) {
                    $mStmt->execute([$toolId, $modelId]);
                }
            }
        }

        // 2. Characteristics
        $charIds = is_string($data['characteristic_ids'] ?? null) ? json_decode($data['characteristic_ids'], true) : ($data['characteristic_ids'] ?? []);
        if (!empty($charIds) && is_array($charIds)) {
            $cStmt = $this->db->prepare("INSERT IGNORE INTO tool_characteristics (id, tool_id, characteristic_id) VALUES (UUID(), ?, ?)");
            foreach ($charIds as $charId) {
                if (!empty($charId)) {
                    $cStmt->execute([$toolId, $charId]);
                }
            }
        }

        // 3. Advantages
        $advantages = is_string($data['advantages'] ?? null) ? json_decode($data['advantages'], true) : ($data['advantages'] ?? []);
        if (!empty($advantages) && is_array($advantages)) {
            $aStmt = $this->db->prepare("INSERT INTO advantages (id, tool_id, advantage_name, created_by, created_at) VALUES (UUID(), ?, ?, ?, NOW())");
            foreach ($advantages as $adv) {
                if (!empty($adv) && trim($adv) !== '') {
                    $aStmt->execute([$toolId, trim($adv), $submittedBy]);
                }
            }
        }

        // 4. Disadvantages
        $disadvantages = is_string($data['disadvantages'] ?? null) ? json_decode($data['disadvantages'], true) : ($data['disadvantages'] ?? []);
        if (!empty($disadvantages) && is_array($disadvantages)) {
            $dStmt = $this->db->prepare("INSERT INTO disadvantages (id, tool_id, disadvantage_name, created_by, created_at) VALUES (UUID(), ?, ?, ?, NOW())");
            foreach ($disadvantages as $disadv) {
                if (!empty($disadv) && trim($disadv) !== '') {
                    $dStmt->execute([$toolId, trim($disadv), $submittedBy]);
                }
            }
        }
    }

    /**
     * Creer ou recuperer un provider
     */
    private function getOrCreateProvider($name)
    {
        if (empty($name)) {
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
                model_ids TEXT DEFAULT NULL,
                characteristic_ids TEXT DEFAULT NULL,
                advantages TEXT DEFAULT NULL,
                disadvantages TEXT DEFAULT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            
            CREATE TABLE IF NOT EXISTS settings (
                key_name VARCHAR(100) PRIMARY KEY,
                value VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        $this->db->exec($sql);

        // Convert existing tables if they were created with a different default collation
        try {
            $this->db->exec("ALTER TABLE tool_suggestions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $this->db->exec("ALTER TABLE settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (\PDOException $e) {
            // Silence potential conversion errors
        }
        
        // Ensure new columns exist for models, characteristics, advantages, disadvantages
        $cols = ['model_ids', 'characteristic_ids', 'advantages', 'disadvantages'];
        foreach ($cols as $col) {
            try {
                $this->db->query("SELECT $col FROM tool_suggestions LIMIT 1");
            } catch (\PDOException $e) {
                $this->db->exec("ALTER TABLE tool_suggestions ADD COLUMN $col TEXT DEFAULT NULL");
            }
        }
        
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

    /**
     * POST /suggestions/autofill
     * Pré-remplir les données d'un outil avec l'IA
     */
    public function autofill()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            $this->jsonResponse(['success' => false, 'error' => 'Authentication required'], 401);
            return;
        }

        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        $name = $data['name'] ?? null;

        if (empty($name)) {
            $this->jsonResponse(['success' => false, 'error' => 'Le nom de l\'outil est requis'], 400);
            return;
        }

        try {
            $this->ensureSuggestionsTable();

            // 1. Récupérer les catégories actives
            $catStmt = $this->db->query("SELECT id, name FROM categories WHERE status = 'active' ORDER BY name ASC");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // 2. Récupérer les caractéristiques actives
            $charStmt = $this->db->query("SELECT id, name, type FROM characteristics WHERE status = 'active' ORDER BY name ASC");
            $characteristics = $charStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // 3. Récupérer les modèles actifs
            $modelStmt = $this->db->query("SELECT id, name FROM models WHERE status = 'active' ORDER BY name ASC");
            $models = $modelStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // 4. Récupérer les noms des outils existants
            $toolsStmt = $this->db->query("SELECT name FROM ai_tools");
            $existingTools = $toolsStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

            // 5. Récupérer les noms des suggestions en attente
            $suggStmt = $this->db->query("SELECT name FROM tool_suggestions WHERE status = 'pending'");
            $pendingTools = $suggStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

            $allExistingNames = array_unique(array_merge($existingTools, $pendingTools));

            // Appeler le service d'autofill IA
            $result = AiService::autofillTool($name, $allExistingNames, $categories, $models, $characteristics);

            $this->jsonResponse([
                'success' => true,
                'real_tool' => $result['real_tool'] ?? true,
                'already_in_db' => $result['already_in_db'] ?? false,
                'reason' => $result['reason'] ?? '',
                'duplicate_tool_name' => $result['duplicate_tool_name'] ?? null,
                'data' => $result['data'] ?? null
            ]);

        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}

