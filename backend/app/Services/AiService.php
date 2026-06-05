<?php

namespace App\Services;

class AiService
{
    private static function getGeminiKey()
    {
        return $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY') ?? '';
    }

    private static function getGithubToken()
    {
        return $_ENV['GITHUB_TOKEN'] ?? getenv('GITHUB_TOKEN') ?? '';
    }

    private static function getGithubModel()
    {
        return $_ENV['GITHUB_MODEL'] ?? getenv('GITHUB_MODEL') ?? 'gpt-4o-mini';
    }

    /**
     * Call GITHUB_TOKEN (GitHub Models API) or GEMINI_API_KEY or use the mock fallback
     */
    public static function generateText($prompt, $systemInstruction = '')
    {
        $githubToken = self::getGithubToken();
        $geminiKey = self::getGeminiKey();

        // 1. Try GitHub Models API
        if (!empty($githubToken)) {
            try {
                $url = "https://models.github.ai/inference/chat/completions";
                
                $messages = [];
                if (!empty($systemInstruction)) {
                    $messages[] = ["role" => "system", "content" => $systemInstruction];
                }
                $messages[] = ["role" => "user", "content" => $prompt];

                $data = [
                    "messages" => $messages,
                    "model" => self::getGithubModel(),
                    "temperature" => 0.8,
                    "top_p" => 0.1,
                    "max_tokens" => 2048
                ];

                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $githubToken,
                    'User-Agent: XploreIA-Backend'
                ]);
                curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && $response) {
                    $result = json_decode($response, true);
                    $text = $result['choices'][0]['message']['content'] ?? '';
                    if (!empty($text)) {
                        return trim($text);
                    }
                }
            } catch (\Exception $e) {
                // Fail silently and try next option
            }
        }

        // 2. Try Gemini API
        if (!empty($geminiKey)) {
            try {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $geminiKey;
                
                $data = [
                    "contents" => [
                        [
                            "parts" => [
                                ["text" => $prompt]
                            ]
                        ]
                    ]
                ];

                if (!empty($systemInstruction)) {
                    $data["systemInstruction"] = [
                        "parts" => [
                            ["text" => $systemInstruction]
                        ]
                    ];
                }

                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json'
                ]);
                curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && $response) {
                    $result = json_decode($response, true);
                    $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    if (!empty($text)) {
                        return trim($text);
                    }
                }
            } catch (\Exception $e) {
                // Fail silently and use fallback
            }
        }
        // 3. Return null if no AI service is available
        return null;
    }

    /**
     * Évaluer un outil IA avec les LLM configurés (GitHub Models ou Gemini)
     * @param array $toolData Les données de l'outil à évaluer
     * @return array ['score' => int, 'feedback' => string, 'details' => array]
     */
    public static function evaluateTool($toolData)
    {
        $categoryName = $toolData['category_name'] ?? 'Inconnue';
        $modelsStr = !empty($toolData['models']) ? implode(', ', $toolData['models']) : 'Aucun';
        $charsStr = !empty($toolData['characteristics']) ? implode(', ', $toolData['characteristics']) : 'Aucune';
        $advsStr = !empty($toolData['advantages']) ? implode(', ', $toolData['advantages']) : 'Aucun';
        $disadvsStr = !empty($toolData['disadvantages']) ? implode(', ', $toolData['disadvantages']) : 'Aucun';

        $prompt = "Évalue l'outil IA suivant sur une échelle de 0 à 100:
        Nom: {$toolData['name']}
        Description: {$toolData['description']}
        Catégorie suggérée: {$categoryName}
        Site web: {$toolData['website_url']}
        Créateur: " . ($toolData['provider_name'] ?? 'Non spécifié') . "
        Tarification: {$toolData['pricing_model']}
        Modèles utilisés: {$modelsStr}
        Caractéristiques principales: {$charsStr}
        Avantages: {$advsStr}
        Inconvénients: {$disadvsStr}";

        $systemInstruction = "Tu es un expert en évaluation d'outils d'intelligence artificielle.
        Ta tâche CRITIQUE est de vérifier si l'outil suggéré existe RÉELLEMENT sur le marché et si les informations fournies sont VRAIES.
        
        RÈGLES DE VALIDATION STRICTES :
        1. VÉRIFICATION D'EXISTENCE : Détermine si l'outil existe réellement dans le monde réel sous ce nom et cette URL officielle. Si l'outil est fictif, inventé, expérimental/privé ou n'existe pas publiquement, attribue STRICTEMENT un score entre 0 et 30 et indique clairement dans le 'feedback' qu'il n'existe pas sur le marché.
        2. EXACTITUDE DES DONNÉES : Vérifie si l'URL fournie correspond au site officiel légitime de l'outil. Si l'URL est fausse, suspecte (par exemple, redirecteurs, faux domaines), ou si l'utilisateur a menti sur le créateur, les modèles utilisés ou les tarifs, pénalise sévèrement le score (maximum 40/100) et explique l'anomalie dans le 'feedback'.
        3. CRÉDIBILITÉ DU MARCHÉ : Vérifie si les caractéristiques, avantages et inconvénients listés correspondent aux capacités réelles du produit.
        
        Renvoie STRICTEMENT un objet JSON contenant les clés :
        - 'score' : nombre de 0 à 100
        - 'feedback' : court paragraphe explicatif en français qui détaille si l'outil a été identifié comme existant sur le marché et si les informations fournies sont valides.
        - 'details' : un objet contenant les notes pour :
            * 'description_quality' (sur 20)
            * 'category_relevance' (sur 15)
            * 'credibility' (sur 15)
            * 'innovation' (sur 20)
            * 'usefulness' (sur 30)
        Le JSON doit être propre, sans format markdown ```json, juste l'objet brut.";

        $aiResponse = self::generateText($prompt, $systemInstruction);

        if ($aiResponse) {
            // Nettoyage de la réponse si enveloppée par du markdown
            $cleanResponse = preg_replace('/```json|```/', '', $aiResponse);
            $cleanResponse = trim($cleanResponse);
            $parsed = json_decode($cleanResponse, true);

            if ($parsed && isset($parsed['score'])) {
                return [
                    'score' => min(max((int)$parsed['score'], 0), 100),
                    'feedback' => $parsed['feedback'] ?? self::generateFeedbackFromScore($parsed['score']),
                    'details' => $parsed['details'] ?? []
                ];
            }
        }

        // Fallback Heuristiques
        return self::fallbackScoring($toolData);
    }

    /**
     * Scoring de secours (sans API)
     */
    private static function fallbackScoring($toolData)
    {
        $score = 0;
        $details = [];
        $feedbackList = [];
        $warnings = [];
        $redFlags = [];

        // 1. Validation de base
        $baseValid = true;
        if (empty($toolData['name']) || strlen($toolData['name']) < 3) {
            $redFlags[] = "Nom invalide ou trop court";
            $baseValid = false;
        }

        $descLength = strlen($toolData['description'] ?? '');
        if ($descLength < 50) {
            $redFlags[] = "Description trop courte (minimum 50 caractères)";
            $baseValid = false;
        }

        if (empty($toolData['website_url']) || !filter_var($toolData['website_url'], FILTER_VALIDATE_URL)) {
            $redFlags[] = "URL du site invalide ou manquante";
            $baseValid = false;
        }

        // 2. Évaluation de la description (max 30 pts)
        if ($descLength >= 300) {
            $score += 30;
            $details['description_quality'] = 20;
            $feedbackList[] = "Description complète et détaillée (300+ caractères)";
        } elseif ($descLength >= 100) {
            $score += 20;
            $details['description_quality'] = 15;
            $feedbackList[] = "Description correcte (100+ caractères)";
        } else {
            $score += 5;
            $details['description_quality'] = 5;
            $feedbackList[] = "Description minimale";
        }

        // 3. Évaluation de l'URL (max 25 pts)
        if (!empty($toolData['website_url']) && filter_var($toolData['website_url'], FILTER_VALIDATE_URL)) {
            $score += 15;
            $details['credibility'] = 10;
            $feedbackList[] = "Site officiel fourni";

            if (strpos($toolData['website_url'], 'https://') === 0) {
                $score += 10;
                $details['credibility'] += 5;
                $feedbackList[] = "Site sécurisé (HTTPS)";
            } else {
                $warnings[] = "URL non sécurisée (HTTP)";
            }

            // Check suspicious domain
            $domain = parse_url($toolData['website_url'], PHP_URL_HOST);
            if ($domain) {
                $suspiciousDomains = ['temp-site.com', 'freehost.com', '000webhost.com', 'wixsite.com', 'blogspot.com'];
                foreach ($suspiciousDomains as $susDomain) {
                    if (strpos($domain, $susDomain) !== false) {
                        $redFlags[] = "Hébergement suspect détecté : " . $domain;
                        $score -= 25;
                    }
                }
                
                $tld = substr($domain, strrpos($domain, '.'));
                $riskyTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.loan'];
                if (in_array($tld, $riskyTLDs)) {
                    $warnings[] = "TLD à risque : " . $tld;
                    $score -= 10;
                }
            }
        }

        // 4. Catégorie (max 15 pts)
        $knownCategories = ['Text Generation', 'Image Generation', 'Code Assistant', 'Audio & Voice', 'Video Generation', 'Chatbot & Assistant', 'Productivity', 'Education', 'Data & Analytics'];
        $category = $toolData['category_name'] ?? '';
        if (in_array($category, $knownCategories)) {
            $score += 15;
            $details['category_relevance'] = 15;
            $feedbackList[] = "Catégorie standard pertinente";
        } else {
            $score += 5;
            $details['category_relevance'] = 5;
        }

        // 5. Créateur et logo (max 15 pts)
        if (!empty($toolData['provider_name'])) {
            $score += 10;
            $feedbackList[] = "Créateur identifié";
        }
        if (!empty($toolData['logo_url'])) {
            $score += 5;
            $feedbackList[] = "Logo fourni";
        }

        // 6. Tarification (max 15 pts)
        $pricing = $toolData['pricing_model'] ?? 'unknown';
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

        // 7. Modèles et relations (max 10 pts)
        if (!empty($toolData['models'])) {
            $score += 5;
        }
        if (!empty($toolData['characteristics'])) {
            $score += 5;
        }

        // 8. Détection de spam / fraude
        $suspiciousNames = ['scam', 'fake', 'test123', 'xxx', 'crypto', 'bitcoin', 'hack', 'cheat', 'illegal', 'pirate', 'free money'];
        $lowerName = strtolower($toolData['name'] ?? '');
        $lowerDesc = strtolower($toolData['description'] ?? '');
        foreach ($suspiciousNames as $suspicious) {
            if (strpos($lowerName, $suspicious) !== false || strpos($lowerDesc, $suspicious) !== false) {
                $redFlags[] = "Terme suspect détecté : " . $suspicious;
                $score -= 30;
            }
        }

        // Limiter le score si non valide de base ou s'il y a des red flags
        if (!$baseValid || count($redFlags) >= 2) {
            $score = min($score, 30);
        } elseif (count($redFlags) >= 1) {
            $score = min($score, 50);
        }

        $score = min(max($score, 0), 100);

        $feedback = "Validation heuristique de secours. " . implode(". ", $feedbackList);
        if (!empty($redFlags)) {
            $feedback .= " alertes : " . implode(", ", $redFlags);
        }

        return [
            'score' => $score,
            'feedback' => $feedback,
            'details' => $details
        ];
    }

    /**
     * Générer un feedback basé sur le score
     */
    private static function generateFeedbackFromScore($score)
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
}

