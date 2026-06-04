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
                    "model" => "deepseek/DeepSeek-V3-0324",
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
}
