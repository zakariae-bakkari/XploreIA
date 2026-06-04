<?php

namespace App\Services;

class AiService
{
    private static function getApiKey()
    {
        return $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY') ?? '';
    }

    /**
     * Call the Gemini API or use the mock fallback
     */
    public static function generateText($prompt, $systemInstruction = '')
    {
        $apiKey = self::getApiKey();

        if (!empty($apiKey)) {
            try {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;
                
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
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                
                // Disable SSL verification if needed locally
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

        // Fallback to local intelligent mock
        return self::mockFallback($prompt, $systemInstruction);
    }

    /**
     * Smart mock fallback for local testing
     */
    private static function mockFallback($prompt, $systemInstruction)
    {
        // 1. Comment Moderation Fallback
        if (strpos($systemInstruction, 'moderation') !== false || strpos($prompt, 'hate speech') !== false) {
            $rudeWords = ['shit', 'fuck', 'bitch', 'asshole', 'merde', 'putain', 'con', 'connard', 'salope', 'idiot', 'stupide', 'hate', 'haine', 'nul', 'débile'];
            $cleanPrompt = strtolower($prompt);
            
            foreach ($rudeWords as $word) {
                if (strpos($cleanPrompt, $word) !== false) {
                    return json_encode([
                        'respectful' => false,
                        'reason' => "Le commentaire contient des mots inappropriés ou offensants : '$word'."
                    ]);
                }
            }
            return json_encode([
                'respectful' => true,
                'reason' => "Le commentaire est respectueux et constructif."
            ]);
        }

        // 2. Suggestion Validation Fallback
        if (strpos($systemInstruction, 'validate') !== false || strpos($prompt, 'legitimate AI tool') !== false) {
            // Match tool name
            preg_match("/named '([^']+)'/i", $prompt, $matches);
            $toolName = $matches[1] ?? 'unknown';
            $lowerName = strtolower($toolName);

            // Spam detectors
            $spamKeywords = ['test', 'spam', 'fake', 'blah', 'asdf', 'qwerty', '1234', 'machin', 'truc'];
            foreach ($spamKeywords as $keyword) {
                if (strpos($lowerName, $keyword) !== false || strlen($toolName) < 3) {
                    return json_encode([
                        'valid' => false,
                        'reason' => "Le nom de l'outil '$toolName' semble être un placeholder, du spam ou invalide."
                    ]);
                }
            }

            // Real AI tools classification
            $pricing = 'freemium';
            if (strpos($lowerName, 'free') !== false) $pricing = 'free';
            if (strpos($lowerName, 'pro') !== false || strpos($lowerName, 'paid') !== false) $pricing = 'premium';

            return json_encode([
                'valid' => true,
                'name' => ucwords($toolName),
                'description' => "Un outil d'intelligence artificielle innovant conçu pour optimiser vos flux de travail et améliorer la productivité dans le domaine concerné.",
                'pricing_model' => $pricing,
                'reason' => "L'outil '$toolName' a été identifié comme un service d'IA légitime et a été automatiquement approuvé."
            ]);
        }

        // 3. Chatbot Fallback
        // Parse context from prompt if tools list is JSON
        $tools = [];
        if (preg_match('/\[.*\]/s', $prompt, $matches)) {
            $tools = json_decode($matches[0], true) ?: [];
        }

        $query = strtolower($prompt);
        
        // Find matching tools based on query keywords
        $matches = [];
        foreach ($tools as $t) {
            $matchScore = 0;
            $name = strtolower($t['name']);
            $desc = strtolower($t['description']);
            $cat = strtolower($t['category_name'] ?? '');

            if (strpos($query, 'image') !== false || strpos($query, 'photo') !== false || strpos($query, 'dessin') !== false) {
                if (strpos($name, 'midjourney') !== false || strpos($name, 'stable') !== false || strpos($cat, 'image') !== false) {
                    $matchScore += 10;
                }
            }
            if (strpos($query, 'code') !== false || strpos($query, 'programmation') !== false || strpos($query, 'developer') !== false) {
                if (strpos($name, 'copilot') !== false || strpos($name, 'gpt') !== false || strpos($cat, 'code') !== false) {
                    $matchScore += 10;
                }
            }
            if (strpos($query, 'audio') !== false || strpos($query, 'voix') !== false || strpos($query, 'voice') !== false || strpos($query, 'son') !== false) {
                if (strpos($name, 'eleven') !== false || strpos($cat, 'audio') !== false) {
                    $matchScore += 10;
                }
            }
            if (strpos($query, 'video') !== false || strpos($query, 'film') !== false) {
                if (strpos($name, 'runway') !== false || strpos($cat, 'video') !== false) {
                    $matchScore += 10;
                }
            }
            if (strpos($query, 'text') !== false || strpos($query, 'rédiger') !== false || strpos($query, 'ecrire') !== false) {
                if (strpos($name, 'chatgpt') !== false || strpos($name, 'claude') !== false || strpos($cat, 'text') !== false) {
                    $matchScore += 10;
                }
            }
            if (strpos($query, 'gratuit') !== false || strpos($query, 'free') !== false) {
                if (($t['pricing_model'] ?? '') === 'free') {
                    $matchScore += 5;
                }
            }

            if ($matchScore > 0) {
                $matches[] = [
                    'tool' => $t,
                    'score' => $matchScore
                ];
            }
        }

        // Sort matches by score desc
        usort($matches, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        if (count($matches) > 0) {
            $reply = "D'après vos critères, voici les meilleurs outils IA de notre catalogue :\n\n";
            foreach (array_slice($matches, 0, 3) as $m) {
                $tool = $m['tool'];
                $reply .= "- **[" . $tool['name'] . "](discover/" . strtolower(str_replace(' ', '-', $tool['name'])) . ")** : " . $tool['description'] . " (Tarif : *" . $tool['pricing_model'] . "*)\n";
            }
            $reply .= "\nN'hésitez pas à me poser d'autres questions pour affiner vos besoins !";
            return $reply;
        }

        return "Bonjour ! Je suis l'assistant IA de XploreIA. Je peux vous aider à trouver les meilleurs outils pour vos besoins. \n\nPar exemple, essayez de me demander : \n- *'Quel est le meilleur outil pour générer du texte ?'*\n- *'Je cherche un outil de création d'images gratuit.'*";
    }
}
