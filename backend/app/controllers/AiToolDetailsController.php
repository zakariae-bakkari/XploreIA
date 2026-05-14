<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
use PDO;

class AiToolDetailsController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /ai-tools/{id}
     * Récupérer les détails complets d'un AI tool
     */
    public function show($id) {
        try {
            // 1. Récupérer les informations de base de l'outil
            $tool = $this->getToolBasicInfo($id);
            
            if (!$tool) {
                $this->jsonResponse([
                    'success' => false,
                    'error' => 'AI Tool not found'
                ], 404);
                return;
            }

            // 2. Récupérer toutes les données liées
            $tool['advantages'] = $this->getAdvantages($id);
            $tool['disadvantages'] = $this->getDisadvantages($id);
            $tool['characteristics'] = $this->getCharacteristics($id);
            $tool['pricing_plans'] = $this->getPricingPlans($id);
            $tool['models'] = $this->getModels($id);
            $tool['reviews'] = $this->getReviews($id);
            $tool['ratings_summary'] = $this->getRatingsSummary($id);
            $tool['similar_tools'] = $this->getSimilarTools($id);
            $tool['statistics'] = $this->getStatistics($id);

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

    /**
     * GET /ai-tools/{id}/advantages
     * Récupérer uniquement les avantages d'un outil
     */
    public function getAdvantagesOnly($id) {
        try {
            $advantages = $this->getAdvantages($id);
            
            $this->jsonResponse([
                'success' => true,
                'data' => $advantages,
                'total' => count($advantages)
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /ai-tools/{id}/disadvantages
     * Récupérer uniquement les inconvénients d'un outil
     */
    public function getDisadvantagesOnly($id) {
        try {
            $disadvantages = $this->getDisadvantages($id);
            
            $this->jsonResponse([
                'success' => true,
                'data' => $disadvantages,
                'total' => count($disadvantages)
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /ai-tools/{id}/pricing
     * Récupérer les plans tarifaires d'un outil
     */
    public function getPricing($id) {
        try {
            $pricing = $this->getPricingPlans($id);
            
            $this->jsonResponse([
                'success' => true,
                'data' => $pricing,
                'total' => count($pricing)
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /ai-tools/{id}/reviews
     * Récupérer les avis d'un outil
     */
    public function getReviewsOnly($id) {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            $reviews = $this->getReviewsPaginated($id, $limit, $offset);
            $total = $this->getReviewsCount($id);
            
            $this->jsonResponse([
                'success' => true,
                'data' => $reviews,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /ai-tools/{id}/reviews
     * Ajouter un avis sur un outil
     */
    public function addReview($id) {
        try {
            // Vérifier si l'utilisateur est connecté (à implémenter avec session/JWT)
            $userId = $_POST['user_id'] ?? null;
            
            if (!$userId) {
                $this->jsonResponse([
                    'success' => false,
                    'error' => 'User not authenticated'
                ], 401);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            if (empty($data['rating']) || empty($data['comment'])) {
                $this->jsonResponse([
                    'success' => false,
                    'error' => 'Rating and comment are required'
                ], 400);
                return;
            }
            
            // Vérifier si l'utilisateur a déjà laissé un avis
            $stmt = $this->db->prepare("
                SELECT id FROM reviews 
                WHERE tool_id = ? AND user_id = ?
            ");
            $stmt->execute([$id, $userId]);
            
            if ($stmt->fetch()) {
                $this->jsonResponse([
                    'success' => false,
                    'error' => 'You have already reviewed this tool'
                ], 409);
                return;
            }
            
            // Ajouter l'avis
            $reviewId = $this->generateUUID();
            $stmt = $this->db->prepare("
                INSERT INTO reviews (id, tool_id, user_id, rating, comment, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'pending', NOW())
            ");
            $stmt->execute([$reviewId, $id, $userId, $data['rating'], $data['comment']]);
            
            // Mettre à jour la note globale de l'outil
            $this->updateGlobalRating($id);
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Review added successfully. Waiting for approval.',
                'data' => ['id' => $reviewId]
            ], 201);
            
        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /ai-tools/{id}/statistics
     * Récupérer les statistiques d'un outil
     */
    public function getStatisticsOnly($id) {
        try {
            $statistics = $this->getStatistics($id);
            
            $this->jsonResponse([
                'success' => true,
                'data' => $statistics
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Récupérer les informations de base de l'outil
     */
    private function getToolBasicInfo($id) {
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
                t.status,
                t.created_at,
                t.updated_at,
                c.id as category_id,
                c.name as category_name,
                c.description as category_description,
                p.id as provider_id,
                p.name as provider_name,
                p.country as provider_country,
                p.description as provider_description,
                p.website_url as provider_website_url,
                p.logo_url as provider_logo_url,
                p.date_founded as provider_founded,
                p.ceo as provider_ceo
            FROM ai_tools t
            LEFT JOIN categories c ON t.main_category_id = c.id
            LEFT JOIN providers p ON t.provider_id = p.id
            WHERE t.id = :id
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les avantages d'un outil
     */
    private function getAdvantages($toolId) {
        $sql = "
            SELECT id, advantage_name as name, created_at
            FROM advantages 
            WHERE tool_id = :tool_id
            ORDER BY created_at ASC
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les inconvénients d'un outil
     */
    private function getDisadvantages($toolId) {
        $sql = "
            SELECT id, disadvantage_name as name, created_at
            FROM disadvantages 
            WHERE tool_id = :tool_id
            ORDER BY created_at ASC
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les caractéristiques d'un outil
     */
    private function getCharacteristics($toolId) {
        $sql = "
            SELECT 
                c.id,
                c.name,
                c.description,
                c.type
            FROM tool_characteristics tc
            JOIN characteristics c ON tc.characteristic_id = c.id
            WHERE tc.tool_id = :tool_id
            AND c.status = 'active'
            ORDER BY c.type, c.name
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        $characteristics = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Grouper par type
        $grouped = [
            'capabilities' => [],
            'modalities' => [],
            'integrations' => [],
            'languages' => [],
            'limitations' => [],
            'other' => []
        ];
        
        foreach ($characteristics as $char) {
            switch ($char['type']) {
                case 'capability':
                    $grouped['capabilities'][] = $char;
                    break;
                case 'modality':
                    $grouped['modalities'][] = $char;
                    break;
                case 'integration':
                    $grouped['integrations'][] = $char;
                    break;
                case 'language':
                    $grouped['languages'][] = $char;
                    break;
                case 'limitation':
                    $grouped['limitations'][] = $char;
                    break;
                default:
                    $grouped['other'][] = $char;
            }
        }
        
        return $grouped;
    }

    /**
     * Récupérer les plans tarifaires d'un outil
     */
    private function getPricingPlans($toolId) {
        $sql = "
            SELECT 
                id,
                plan_name,
                pricing_type,
                tier_number,
                price_month,
                price_year,
                features
            FROM pricing_plans 
            WHERE tool_id = :tool_id
            ORDER BY tier_number ASC, price_month ASC
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Décoder les features si c'est du JSON
        foreach ($plans as &$plan) {
            if ($plan['features']) {
                $features = json_decode($plan['features'], true);
                $plan['features'] = $features ?: explode(',', $plan['features']);
            } else {
                $plan['features'] = [];
            }
        }
        
        return $plans;
    }

    /**
     * Récupérer les modèles d'un outil
     */
    private function getModels($toolId) {
        $sql = "
            SELECT 
                m.id,
                m.name,
                m.description,
                m.tags,
                perf.response_quality,
                perf.speed
            FROM tool_models tm
            JOIN models m ON tm.model_id = m.id
            LEFT JOIN performance perf ON m.id = perf.model_id
            WHERE tm.tool_id = :tool_id
            AND m.status = 'active'
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        $models = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Transformer les tags en tableau
        foreach ($models as &$model) {
            $model['tags'] = $model['tags'] ? explode(',', $model['tags']) : [];
        }
        
        return $models;
    }

    /**
     * Récupérer les avis d'un outil
     */
    private function getReviews($toolId) {
        $sql = "
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                r.status,
                u.id as user_id,
                u.name as user_name,
                u.profile_url as user_avatar
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.tool_id = :tool_id 
            AND r.status = 'approved'
            ORDER BY r.created_at DESC
            LIMIT 10
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les avis paginés
     */
    private function getReviewsPaginated($toolId, $limit, $offset) {
        $sql = "
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                u.id as user_id,
                u.name as user_name,
                u.profile_url as user_avatar
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.tool_id = :tool_id 
            AND r.status = 'approved'
            ORDER BY r.created_at DESC
            LIMIT :limit OFFSET :offset
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':tool_id', $toolId);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Compter le nombre total d'avis
     */
    private function getReviewsCount($toolId) {
        $sql = "
            SELECT COUNT(*) as total
            FROM reviews
            WHERE tool_id = :tool_id AND status = 'approved'
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    /**
     * Récupérer le résumé des notes
     */
    private function getRatingsSummary($toolId) {
        $sql = "
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
            FROM reviews
            WHERE tool_id = :tool_id AND status = 'approved'
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'total' => (int)$result['total_reviews'],
            'average' => round((float)$result['average_rating'], 1),
            'distribution' => [
                5 => (int)$result['rating_5'],
                4 => (int)$result['rating_4'],
                3 => (int)$result['rating_3'],
                2 => (int)$result['rating_2'],
                1 => (int)$result['rating_1']
            ]
        ];
    }

    /**
     * Récupérer des outils similaires
     */
    private function getSimilarTools($toolId) {
        // Récupérer d'abord la catégorie de l'outil actuel
        $sql = "
            SELECT main_category_id, provider_id
            FROM ai_tools
            WHERE id = :tool_id
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$current) {
            return [];
        }
        
        // Récupérer les outils de la même catégorie
        $sql = "
            SELECT 
                t.id,
                t.name,
                t.description,
                t.logo_url,
                t.global_rating,
                t.pricing_model,
                c.name as category_name
            FROM ai_tools t
            LEFT JOIN categories c ON t.main_category_id = c.id
            WHERE t.id != :tool_id
            AND t.status = 'published'
            AND t.main_category_id = :category_id
            ORDER BY t.global_rating DESC
            LIMIT 6
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':tool_id' => $toolId,
            ':category_id' => $current['main_category_id']
        ]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les statistiques globales
     */
    private function getStatistics($toolId) {
        $stats = [];
        
        // Nombre total de vues (à implémenter avec une table de tracking)
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total_views
            FROM history
            WHERE content = :tool_id AND type = 'view'
        ");
        $stmt->execute([':tool_id' => $toolId]);
        $stats['total_views'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_views'];
        
        // Nombre de fois ajouté aux playlists
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total_playlists
            FROM playlist_items
            WHERE tool_id = :tool_id
        ");
        $stmt->execute([':tool_id' => $toolId]);
        $stats['total_playlists'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_playlists'];
        
        // Nombre de comparaisons
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total_compares
            FROM history
            WHERE content LIKE :pattern AND type = 'compare'
        ");
        $stmt->execute([':pattern' => "%{$toolId}%"]);
        $stats['total_compares'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_compares'];
        
        return $stats;
    }

    /**
     * Mettre à jour la note globale d'un outil
     */
    private function updateGlobalRating($toolId) {
        $sql = "
            UPDATE ai_tools t
            SET t.global_rating = (
                SELECT AVG(rating)
                FROM reviews
                WHERE tool_id = :tool_id AND status = 'approved'
            )
            WHERE t.id = :tool_id
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tool_id' => $toolId]);
    }

    /**
     * Générer un UUID
     */
    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}