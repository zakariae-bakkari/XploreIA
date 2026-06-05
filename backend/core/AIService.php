<?php

namespace Core;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class AIService
{
    private $client;
    private $apiKey;
    private $apiUrl;

    public function __construct()
    {
        $this->client = new Client(['timeout' => 30]);
        $this->apiKey = getenv('OPENAI_API_KEY') ?: '';
        $this->apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    /**
     * Évaluer un outil IA avec OpenAI
     * @param array $toolData Les données de l'outil à évaluer
     * @return array ['score' => int, 'feedback' => string, 'details' => array]
     */
    public function evaluateTool($toolData)
    {
        // Si pas de clé API, utiliser scoring simple
        if (empty($this->apiKey)) {
            return $this->fallbackScoring($toolData);
        }

        $prompt = $this->buildEvaluationPrompt($toolData);

        try {
            $response = $this->client->post($this->apiUrl, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => "Tu es un expert en évaluation d'outils d'intelligence artificielle. Tu dois évaluer l'outil présenté sur plusieurs critères et donner un score sur 100."
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'temperature' => 0.3,
                    'max_tokens' => 500
                ]
            ]);

            $body = json_decode($response->getBody(), true);
            $aiResponse = $body['choices'][0]['message']['content'] ?? '';

            return $this->parseAIResponse($aiResponse, $toolData);

        } catch (RequestException $e) {
            error_log('AI Service error: ' . $e->getMessage());
            return $this->fallbackScoring($toolData);
        }
    }

    /**
     * Construire le prompt d'évaluation
     */
    private function buildEvaluationPrompt($toolData)
    {
        return "
        Évalue l'outil IA suivant sur une échelle de 0 à 100 selon ces critères:

        📌 INFORMATIONS DE L'OUTIL:
        - Nom: {$toolData['name']}
        - Description: {$toolData['description']}
        - Catégorie: {$toolData['category']}
        - Site web: {$toolData['website_url']}
        - Créateur: " . ($toolData['provider_name'] ?? 'Non spécifié') . "
        - Modèle tarifaire: {$toolData['pricing_model']}

        📊 CRITÈRES D'ÉVALUATION (poids):
        1. Qualité de la description (20 points) - Est-elle claire, détaillée, convaincante ?
        2. Pertinence de la catégorie (15 points) - La catégorie est-elle adaptée ?
        3. Crédibilité du créateur (15 points) - Créateur connu ? Site web légitime ?
        4. Originalité / Innovation (20 points) - L'outil apporte-t-il quelque chose de nouveau ?
        5. Potentiel d'utilité (30 points) - Répond-il à un vrai besoin ?

        Réponds STRICTEMENT au format JSON suivant:
        {
            "score": nombre_entre_0_et_100,
            "feedback": "message court expliquant le score",
            "details": {
                "description_quality": nombre_entre_0_et_20,
                "category_relevance": nombre_entre_0_et_15,
                "credibility": nombre_entre_0_et_15,
                "innovation": nombre_entre_0_et_20,
                "usefulness": nombre_entre_0_et_30
            }
        }
        ";
    }

    /**
     * Parser la réponse de l'IA
     */
    private function parseAIResponse($response, $toolData)
    {
        // Essayer d'extraire le JSON
        preg_match('/\{[^{}]*\}/', $response, $matches);
        
        if (empty($matches)) {
            return $this->fallbackScoring($toolData);
        }

        $data = json_decode($matches[0], true);
        
        if (!$data || !isset($data['score'])) {
            return $this->fallbackScoring($toolData);
        }

        return [
            'score' => min(max((int)$data['score'], 0), 100),
            'feedback' => $data['feedback'] ?? $this->generateFeedbackFromScore($data['score']),
            'details' => $data['details'] ?? []
        ];
    }

    /**
     * Scoring de secours (sans API)
     */
    private function fallbackScoring($toolData)
    {
        $score = 50;
        $details = [];
        
        // Description
        $descLength = strlen($toolData['description']);
        if ($descLength > 200) {
            $score += 15;
            $details['description_quality'] = 15;
        } elseif ($descLength > 100) {
            $score += 10;
            $details['description_quality'] = 10;
        } else {
            $details['description_quality'] = 5;
        }
        
        // URL valide
        if (filter_var($toolData['website_url'], FILTER_VALIDATE_URL)) {
            $score += 10;
            $details['credibility'] = 10;
        }
        
        // Catégorie connue
        $knownCategories = ['Text Generation', 'Image Generation', 'Code Assistant', 'Audio & Voice', 'Video Generation', 'Chatbot & Assistant'];
        if (in_array($toolData['category'], $knownCategories)) {
            $score += 10;
            $details['category_relevance'] = 10;
        }
        
        // Logo fourni
        if (!empty($toolData['logo_url'])) {
            $score += 5;
        }
        
        // Provider fourni
        if (!empty($toolData['provider_name'])) {
            $score += 5;
        }
        
        $score = min(max($score, 0), 100);
        
        return [
            'score' => $score,
            'feedback' => $this->generateFeedbackFromScore($score),
            'details' => $details
        ];
    }

    /**
     * Générer un feedback basé sur le score
     */
    private function generateFeedbackFromScore($score)
    {
        if ($score >= 85) {
            return "🎉 Excellent outil ! Tous les critères sont excellents. À ajouter d'urgence !";
        } elseif ($score >= 70) {
            return "✅ Très bon outil. Quelques améliorations mineures suggérées mais globalement solide.";
        } elseif ($score >= 55) {
            return "👍 Outil intéressant. Bon potentiel mais certaines informations manquent.";
        } elseif ($score >= 40) {
            return "⚠️ Outil correct mais nécessite des améliorations significatives.";
        } else {
            return "❌ L'outil ne répond pas aux critères de qualité minimum. Veuillez fournir plus d'informations.";
        }
    }

    /**
     * Vérifier si la clé API est configurée
     */
    public function isConfigured()
    {
        return !empty($this->apiKey);
    }
}