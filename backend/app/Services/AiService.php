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
        2. EXACTITUDE DES DONNÉES : Vérifie si l'URL fournie correspond au site officiel légitime de l'outil.
           * NOTE IMPORTANTE : Les domaines officiels comme 'claude.ai' (pour Claude par Anthropic), 'suno.com'/'suno.ai' (pour Suno), 'midjourney.com' (pour Midjourney), etc. sont tout à fait valides et légitimes. Ne pénalise pas un outil réel sous prétexte que son URL utilise le domaine de la marque avec l'extension .ai, .com, .app, .co, ou .io.
           * Si l'URL est réellement fausse, suspecte (par exemple, redirecteurs malveillants, faux domaines de phishing type 'free-claude-coins.xyz'), ou si l'utilisateur a menti sur le créateur, les modèles utilisés ou les tarifs, pénalise sévèrement le score (maximum 40/100) et explique l'anomalie dans le 'feedback'.
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

    /**
     * Autofill a tool's details using AI and check if it exists / is a duplicate
     */
    public static function autofillTool($toolName, $existingToolNames, $categories, $models, $characteristics)
    {
        $toolName = trim($toolName);
        
        // 1. Programmatic local duplicate check (case-insensitive check first for safety)
        $lowerName = strtolower($toolName);
        foreach ($existingToolNames as $existingName) {
            if (strtolower(trim($existingName)) === $lowerName) {
                return [
                    'real_tool' => true,
                    'already_in_db' => true,
                    'reason' => "L'outil '" . $existingName . "' est déjà enregistré dans notre catalogue.",
                    'duplicate_tool_name' => $existingName,
                    'data' => null
                ];
            }
        }

        // Check for obvious fictional / future versions locally to save API calls
        $suspiciousPatterns = [
            '/chatgpt\s*[56789]/i',
            '/claude\s*[45678]/i',
            '/midjourney\s*(v)?\s*(7|8|9|10|11|12|13)/i',
            '/suno\s*(v)?\s*(5|6|7|8)/i'
        ];
        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $toolName)) {
                return [
                    'real_tool' => false,
                    'already_in_db' => false,
                    'reason' => "Cet outil n'existe pas ou n'a pas encore été publié officiellement.",
                    'duplicate_tool_name' => null,
                    'data' => null
                ];
            }
        }

        // Format references for AI prompt
        $existingToolsStr = implode(', ', $existingToolNames);
        
        $categoriesJson = json_encode($categories, JSON_UNESCAPED_UNICODE);
        $modelsJson = json_encode($models, JSON_UNESCAPED_UNICODE);
        $charsJson = json_encode($characteristics, JSON_UNESCAPED_UNICODE);

        $prompt = "Voici les informations pour l'outil suggéré par l'utilisateur:
        Nom de l'outil suggéré: \"{$toolName}\"

        Voici la liste des outils déjà présents dans notre base de données:
        [{$existingToolsStr}]

        Voici la liste des catégories valides avec leurs identifiants:
        {$categoriesJson}

        Voici la liste des modèles IA valides avec leurs identifiants:
        {$modelsJson}

        Voici la liste des caractéristiques valides avec leurs identifiants:
        {$charsJson}";

        $systemInstruction = "Tu es un expert en outils d'intelligence artificielle.
        Ta tâche est d'analyser l'outil demandé par l'utilisateur (\"{$toolName}\") et de retourner un objet JSON structuré pour pré-remplir ses caractéristiques.

        Consignes strictes :
        1. VÉRIFICATION D'EXISTENCE (real_tool) : Détermine si l'outil existe réellement aujourd'hui. Si l'outil est fictif, inexistant, ou correspond à une version future non-existante (ex. ChatGPT 6, Claude 5, Midjourney v12, etc.), mets 'real_tool' à false et explique brièvement pourquoi dans 'reason' (en français).
        2. DÉTECTION DE DOUBLON (already_in_db) : Vérifie si cet outil est déjà présent dans notre base de données (comparer de manière sémantique ou par nom proche avec la liste fournie). Si oui, mets 'already_in_db' à true, indique le nom de l'outil correspondant dans 'duplicate_tool_name' et explique-le dans 'reason' (en français).
        3. PRÉ-REMPLISSAGE (dans la clé 'data') : Si l'outil est réel et n'est pas un doublon :
           - 'description' : Génère une description concise et professionnelle en français (150 à 250 caractères).
           - 'website_url' : L'URL officielle du site web de l'outil (ex: https://suno.com).
           - 'pricing_model' : Choisis strictement parmi ['free', 'freemium', 'premium'].
           - 'main_category_id' : L'identifiant (UUID) de la catégorie qui correspond le mieux parmi la liste fournie. Ne renvoie rien d'autre qu'un identifiant existant de la liste, ou null si aucune catégorie ne correspond.
           - 'model_ids' : Un tableau contenant les identifiants (UUID) des modèles IA utilisés par cet outil, sélectionnés uniquement dans la liste des modèles fournie. Si l'outil n'utilise aucun de ces modèles ou si ce n'est pas applicable, renvoie un tableau vide [].
           - 'characteristic_ids' : Un tableau contenant les identifiants (UUID) des caractéristiques applicables à cet outil, sélectionnés uniquement dans la liste des caractéristiques fournie. Sélectionne au moins 1 ou 2 caractéristiques pertinentes si possible, ou laisse vide [].
           - 'advantages' : Un tableau de 2 à 4 avantages majeurs de l'outil en français (phrases courtes).
           - 'disadvantages' : Un tableau de 2 à 4 inconvénients majeurs de l'outil en français (phrases courtes).

        Renvoie UNIQUEMENT un objet JSON brut respectant exactement cette structure, sans aucun formatage markdown comme ```json ou ``` :
        {
          \"real_tool\": true,
          \"already_in_db\": false,
          \"reason\": \"\",
          \"duplicate_tool_name\": null,
          \"data\": {
            \"description\": \"...\",
            \"website_url\": \"...\",
            \"pricing_model\": \"freemium\",
            \"main_category_id\": \"UUID-de-la-categorie\",
            \"model_ids\": [\"UUID-du-modele-1\"],
            \"characteristic_ids\": [\"UUID-char-1\", \"UUID-char-2\"],
            \"advantages\": [\"...\", \"...\"],
            \"disadvantages\": [\"...\", \"...\"]
          }
        }";

        $aiResponse = self::generateText($prompt, $systemInstruction);

        if ($aiResponse) {
            $cleanResponse = preg_replace('/```json|```/', '', $aiResponse);
            $cleanResponse = trim($cleanResponse);
            $parsed = json_decode($cleanResponse, true);

            if ($parsed && isset($parsed['real_tool'])) {
                return $parsed;
            }
        }

        // Si l'IA n'est pas configurée ou échoue
        return [
            'real_tool' => true,
            'already_in_db' => false,
            'reason' => "Impossible de contacter le service de validation IA.",
            'duplicate_tool_name' => null,
            'data' => null
        ];
    }
}

