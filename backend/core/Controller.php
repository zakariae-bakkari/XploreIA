<?php

namespace Core;

class Controller {
    protected function jsonResponse($data, $status = 200) {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *'); // For React frontend
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        http_response_code($status);
        echo json_encode($data);
        exit;
    }
}