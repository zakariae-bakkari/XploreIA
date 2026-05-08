<?php

namespace Core;

class Controller {
    protected function jsonResponse($data, $status = 200) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: application/json');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        http_response_code($status);
        echo json_encode($data);
        exit;
    }
}