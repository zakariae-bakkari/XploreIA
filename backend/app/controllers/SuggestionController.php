<?php

namespace App\Controllers;

use Core\Controller;
use Core\Database;
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
            // Verifier les doublons
            $duplicateCheck = $this->checkDuplicate($data['name']);
            
            // Calculer le score
            $aiResult = $this->calculateScore($data, $duplicateCheck);

            // Generer un ID
            $id = $this->generateUUID();

            // Creer la table si necessaire
            $this->ensureSuggestionsTable();

            $stmt = $this->db->prepare("
                INSERT INTO tool_suggestions 
                (id, name, description, website_url, logo_url, category, pricing_model, provider_name, ai_score, ai_feedback, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            ");

            $stmt->execute([
                $id,
                $data['name'],
                $data['description'],
                $data['website_url'],
                $data['logo_url'] ?? null,
                $data['category'],
                $data['pricing_model'] ?? 'unknown',
                $data['provider_name'] ?? null,
                $aiResult['score'],
                $aiResult['feedback']
            ]);

            $this->jsonResponse([
                'success' => true,
                'message' => 'Suggestion soumise avec succes',
                'data' => [
                    'id' => $id,
                    'ai_score' => $aiResult['score'],
                    'ai_feedback' => $aiResult['feedback'],
                    'ai_details' => $aiResult['details'] ?? [],
                    'warnings' => $aiResult['warnings'] ?? [],
                    'red_flags' => $aiResult['red_flags'] ?? []
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
        try {
            $this->ensureSuggestionsTable();
            
            $stmt = $this->db->prepare("
                SELECT s.*, u.name as submitter_name, u.email as submitter_email
                FROM tool_suggestions s
                LEFT JOIN users u ON s.submitted_by = u.id
                WHERE s.status = 'pending'
                ORDER BY s.created_at DESC
            ");
            $stmt->execute();
            
            $this->jsonResponse([
                'success' => true,
                'data' => $stmt->fetchAll()
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /suggestions/{id}/approve
     * Approuver une suggestion
     */
    public function approve($id)
    {
        try {
            $this->ensureSuggestionsTable();
            
            $stmt = $this->db->prepare("SELECT * FROM tool_suggestions WHERE id = ?");
            $stmt->execute([$id]);
            $suggestion = $stmt->fetch();
            
            if (!$suggestion) {
                $this->jsonResponse(['error' => 'Suggestion not found'], 404);
                return;
            }
            
            $providerId = $this->getOrCreateProvider($suggestion['provider_name']);
            $toolId = $this->createAiTool($suggestion, $providerId);
            
            $stmt = $this->db->prepare("UPDATE tool_suggestions SET status = 'approved' WHERE id = ?");
            $stmt->execute([$id]);
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Outil approuve et ajoute a la base de donnees',
                'data' => ['tool_id' => $toolId]
            ]);
            
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /suggestions/{id}/reject
     * Rejeter une suggestion
     */
    public function reject($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $reason = $data['reason'] ?? 'Aucune raison fournie';
        
        try {
            $this->ensureSuggestionsTable();
            
            $stmt = $this->db->prepare("
                UPDATE tool_suggestions 
                SET status = 'rejected', admin_notes = ? 
                WHERE id = ?
            ");
            $stmt->execute([$reason, $id]);
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Suggestion rejetee'
            ]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    // ==================== METHODES PRIVEES ====================

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
        if (empty($data['category'])) {
            $errors['category'] = 'La categorie est requise';
        }

        return $errors;
    }

    /**
     * Verifier si l'outil existe deja dans la base de donnees
     */
    private function checkDuplicate($name)
    {
        try {
            // Verifier dans ai_tools
            $stmt = $this->db->prepare("SELECT id, name FROM ai_tools WHERE name LIKE :name");
            $stmt->execute([':name' => '%' . $name . '%']);
            $existing = $stmt->fetch();
            
            if ($existing) {
                return [
                    'exists' => true,
                    'id' => $existing['id'],
                    'name' => $existing['name'],
                    'source' => 'catalogue'
                ];
            }
            
            // Verifier dans les suggestions en attente
            $stmt = $this->db->prepare("SELECT id, name FROM tool_suggestions WHERE name LIKE :name AND status = 'pending'");
            $stmt->execute([':name' => '%' . $name . '%']);
            $pending = $stmt->fetch();
            
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
     * Calculer le score selon plusieurs criteres
     */
    private function calculateScore($data, $duplicateCheck = null)
{
    // Initialisation : score de base à 0 (pas de points gratuits)
    $score = 0;
    $details = [];
    $feedbackList = [];
    $warnings = [];
    $redFlags = [];
    
    // Poids maximum par critere
    $maxScore = 100;

    // ==================== 1. VALIDATION DE BASE (obligatoire) ====================
    $baseValid = true;
    
    if (empty($data['name']) || strlen($data['name']) < 3) {
        $redFlags[] = "Nom invalide ou trop court (minimum 3 caracteres)";
        $baseValid = false;
    }
    
    if (empty($data['description']) || strlen($data['description']) < 50) {
        $redFlags[] = "Description trop courte (" . (strlen($data['description']) ?? 0) . " caracteres). Minimum 50 requis.";
        $baseValid = false;
    }
    
    if (empty($data['website_url']) || !filter_var($data['website_url'], FILTER_VALIDATE_URL)) {
        $redFlags[] = "URL invalide ou manquante";
        $baseValid = false;
    }
    
    if (empty($data['category'])) {
        $redFlags[] = "Categorie non selectionnee";
        $baseValid = false;
    }
    
    // Si validation de base echoue, score maximum 30
    if (!$baseValid) {
        $score = min($score, 30);
    }

    // ==================== 2. DETECTION DE DOUBLONS ====================
    if ($duplicateCheck && $duplicateCheck['exists']) {
        $source = $duplicateCheck['source'] === 'catalogue' ? 'present dans notre catalogue' : 'deja suggere (en attente)';
        $redFlags[] = "DOUBLON: Outil deja " . $source . " - " . $duplicateCheck['name'];
        $score = 0;
        $maxScore = 100;
    } else {
        
        // ==================== 3. CRITERES DE QUALITE ====================
        
        // --- DESCRIPTION (max 30 points) ---
        $descLength = strlen($data['description']);
        if ($descLength >= 300) {
            $score += 30;
            $details['description'] = 30;
            $feedbackList[] = "Description excellente (plus de 300 caracteres)";
        } elseif ($descLength >= 150) {
            $score += 25;
            $details['description'] = 25;
            $feedbackList[] = "Description complete (150+ caracteres)";
        } elseif ($descLength >= 100) {
            $score += 18;
            $details['description'] = 18;
            $feedbackList[] = "Description correcte (100+ caracteres)";
        } elseif ($descLength >= 75) {
            $score += 10;
            $details['description'] = 10;
            $feedbackList[] = "Description moyenne (75+ caracteres)";
        } elseif ($descLength >= 50) {
            $score += 5;
            $details['description'] = 5;
            $feedbackList[] = "Description minimale requise";
        } else {
            $details['description'] = 0;
            $feedbackList[] = "Description insuffisante (moins de 50 caracteres)";
        }
        
        // Format de la description (bonus)
        $hasPunctuation = preg_match('/[.!?]$/', trim($data['description']));
        $hasCapitalLetter = preg_match('/^[A-Z]/', trim($data['description']));
        if ($hasPunctuation && $hasCapitalLetter && $descLength >= 50) {
            $score += 5;
            $details['format'] = 5;
            $feedbackList[] = "Description bien formatee";
        }
        
        // --- URL (max 20 points) ---
        if (filter_var($data['website_url'], FILTER_VALIDATE_URL)) {
            $score += 10;
            $details['url_valid'] = 10;
            $feedbackList[] = "URL valide";
            
            if (strpos($data['website_url'], 'https://') === 0) {
                $score += 10;
                $details['url_https'] = 10;
                $feedbackList[] = "Site securise (HTTPS)";
            } else {
                $warnings[] = "Site non securise (HTTP)";
                $feedbackList[] = "Site non securise (HTTPS manquant)";
            }
        } else {
            $details['url_valid'] = 0;
            $redFlags[] = "URL invalide";
        }
        
        // --- DOMAINE (max 5 points, malus possible) ---
        $domain = parse_url($data['website_url'], PHP_URL_HOST);
        if ($domain) {
            $suspiciousDomains = ['temp-site.com', 'freehost.com', '000webhost.com', 'wixsite.com'];
            foreach ($suspiciousDomains as $susDomain) {
                if (strpos($domain, $susDomain) !== false) {
                    $redFlags[] = "Domaine d'hebergement suspect: " . $domain;
                    $score -= 10;
                }
            }
            
            $tld = substr($domain, strrpos($domain, '.'));
            $riskyTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.loan'];
            if (in_array($tld, $riskyTLDs)) {
                $warnings[] = "Extension de domaine risquee: " . $tld;
                $score -= 5;
            }
        }
        
        // --- CATEGORIE (max 15 points) ---
        $knownCategories = [
            'Text Generation', 'Image Generation', 'Code Assistant', 
            'Audio & Voice', 'Video Generation', 'Chatbot & Assistant', 
            'Data & Analytics', 'Productivity', 'Education'
        ];
        if (in_array($data['category'], $knownCategories)) {
            $score += 15;
            $details['category'] = 15;
            $feedbackList[] = "Categorie pertinente";
        } else {
            $score += 5;
            $details['category'] = 5;
            $warnings[] = "Categorie non standard";
        }
        
        // --- LOGO (max 10 points) ---
        if (!empty($data['logo_url'])) {
            if (filter_var($data['logo_url'], FILTER_VALIDATE_URL)) {
                $score += 10;
                $details['logo'] = 10;
                $feedbackList[] = "Logo valide fourni";
            } else {
                $warnings[] = "URL du logo invalide";
                $score += 3;
            }
        } else {
            $details['logo'] = 0;
            $feedbackList[] = "Logo non fourni";
        }
        
        // --- CREATEUR (max 15 points) ---
        if (!empty($data['provider_name'])) {
            $knownProviders = ['OpenAI', 'Google', 'Microsoft', 'Anthropic', 'Meta', 'Amazon', 'IBM', 'Stability AI', 'Midjourney'];
            if (in_array($data['provider_name'], $knownProviders)) {
                $score += 15;
                $details['provider'] = 15;
                $feedbackList[] = "Createur reconnu (marque connue)";
            } else {
                $score += 10;
                $details['provider'] = 10;
                $feedbackList[] = "Createur identifie";
            }
        } else {
            $details['provider'] = 0;
            $warnings[] = "Createur non specifie";
        }
        
        // --- TARIFICATION (max 10 points) ---
        switch ($data['pricing_model']) {
            case 'free':
                $score += 10;
                $details['pricing'] = 10;
                $feedbackList[] = "Outil gratuit";
                break;
            case 'freemium':
                $score += 7;
                $details['pricing'] = 7;
                $feedbackList[] = "Freemium avec version gratuite";
                break;
            case 'premium':
                $score += 3;
                $details['pricing'] = 3;
                $feedbackList[] = "Outil payant";
                break;
            default:
                $score += 1;
                $details['pricing'] = 1;
                $warnings[] = "Tarification non specifiee";
        }
    }
    
    // ==================== 4. MALUS SUPPLEMENTAIRES ====================
    
    // Detection de noms suspects
    $suspiciousNames = ['scam', 'fake', 'test123', 'xxx', 'crypto', 'bitcoin', 'hack', 'cheat', 'illegal', 'pirate'];
    $lowerName = strtolower($data['name']);
    foreach ($suspiciousNames as $suspicious) {
        if (strpos($lowerName, $suspicious) !== false) {
            $redFlags[] = "Nom suspect detecte: " . $suspicious;
            $score -= 20;
        }
    }
    
    // Detection de mots-cles suspects dans description
    $suspiciousKeywords = ['scam', 'fake', 'virus', 'malware', 'phishing', 'spam', 'illegal'];
    $lowerDesc = strtolower($data['description']);
    foreach ($suspiciousKeywords as $keyword) {
        if (strpos($lowerDesc, $keyword) !== false) {
            $redFlags[] = "Terme suspect dans la description: " . $keyword;
            $score -= 25;
        }
    }
    
    // ==================== 5. LIMITATION DU SCORE ====================
    // Limitation selon les red flags
    if (count($redFlags) >= 3) {
        $score = min($score, 30);
    } elseif (count($redFlags) >= 1) {
        $score = min($score, 60);
    }
    
    // Score final entre 0 et 100
    $score = min(max($score, 0), 100);
    
    // ==================== 6. GENERATION DU FEEDBACK ====================
    $globalFeedback = $this->getGlobalFeedback($score, count($redFlags), count($warnings));
    
    $fullFeedback = "";
    $fullFeedback .= $globalFeedback . "\n\n";
    
    if (!empty($redFlags)) {
        $fullFeedback .= "ALERTES (action requise):\n";
        foreach ($redFlags as $flag) {
            $fullFeedback .= "- " . $flag . "\n";
        }
        $fullFeedback .= "\n";
    }
    
    if (!empty($warnings)) {
        $fullFeedback .= "ATTENTIONS:\n";
        foreach ($warnings as $warning) {
            $fullFeedback .= "- " . $warning . "\n";
        }
        $fullFeedback .= "\n";
    }
    
    $fullFeedback .= "DETAIL DES POINTS:\n";
    foreach ($feedbackList as $fb) {
        $fullFeedback .= "- " . $fb . "\n";
    }
    $fullFeedback .= "\n";
    
    $fullFeedback .= "SCORE FINAL: " . $score . "/100\n\n";
    
    if ($score < 40) {
        $fullFeedback .= "RECOMMANDATION: Cette suggestion necessite une verification approfondie avant approbation.";
    } elseif ($score < 60) {
        $fullFeedback .= "RECOMMANDATION: Ameliorer les informations manquantes pour approbation.";
    } else {
        $fullFeedback .= "RECOMMANDATION: Outil de qualite, peut etre approuve.";
    }
    
    return [
        'score' => $score,
        'feedback' => $fullFeedback,
        'details' => $details,
        'warnings' => $warnings,
        'red_flags' => $redFlags
    ];
}

    /**
     * Feedback global selon le score
     */
    private function getGlobalFeedback($score, $redFlagsCount, $warningsCount)
    {
        if ($score >= 85 && $redFlagsCount == 0) {
            return "OUTIL EXCEPTIONNEL - Tous les criteres sont excellents.";
        } elseif ($score >= 70 && $redFlagsCount == 0) {
            return "OUTIL DE QUALITE - Informations completes et pertinentes.";
        } elseif ($score >= 55 && $redFlagsCount == 0) {
            return "OUTIL CORRECT - Quelques ameliorations suggerees.";
        } elseif ($score >= 40) {
            return "OUTIL A VERIFIER - Des informations importantes manquent ou sont suspectes.";
        } else {
            return "OUTIL REJETE - Ne repond pas aux criteres de qualite. Suspicion de contenu non valide.";
        }
    }

    /**
     * Creer ou recuperer un provider
     */
    private function getOrCreateProvider($name)
    {
        if (empty($name)) return null;
        
        $stmt = $this->db->prepare("SELECT id FROM providers WHERE name = ?");
        $stmt->execute([$name]);
        $provider = $stmt->fetch();
        
        if ($provider) {
            return $provider['id'];
        }
        
        $id = $this->generateUUID();
        $stmt = $this->db->prepare("INSERT INTO providers (id, name, status) VALUES (?, ?, 'pending')");
        $stmt->execute([$id, $name]);
        
        return $id;
    }

    /**
     * Creer un AI tool a partir d'une suggestion
     */
    private function createAiTool($suggestion, $providerId)
    {
        $id = $this->generateUUID();
        
        $stmt = $this->db->prepare("
            INSERT INTO ai_tools 
            (id, name, description, website_url, logo_url, provider_id, pricing_model, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        ");
        
        $stmt->execute([
            $id,
            $suggestion['name'],
            $suggestion['description'],
            $suggestion['website_url'],
            $suggestion['logo_url'],
            $providerId,
            $suggestion['pricing_model']
        ]);
        
        return $id;
    }

    /**
     * Creer la table tool_suggestions si elle n'existe pas
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
                category VARCHAR(100),
                pricing_model VARCHAR(20) DEFAULT 'unknown',
                provider_name VARCHAR(255),
                submitted_by VARCHAR(50),
                ai_score INT DEFAULT NULL,
                ai_feedback TEXT,
                admin_notes TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ";
        $this->db->exec($sql);
    }

    /**
     * Generer un UUID simple
     */
    private function generateUUID()
    {
        return uniqid() . '-' . rand(1000, 9999) . '-' . time();
    }
}