<?php

namespace Core;

class Controller
{
    protected function requireRole($roles, $status = 403, $message = 'Access denied')
    {
        $allowedRoles = is_array($roles) ? $roles : [$roles];
        $currentRole = $_SESSION['user_role'] ?? null;

        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Authentication required'
            ], 401);
        }

        if (!in_array($currentRole, $allowedRoles, true)) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => $message
            ], $status);
        }
    }

    protected function requireAdmin($message = 'Admin access required')
    {
        $this->requireRole('admin', 403, $message);
    }

    protected function jsonResponse($data, $status = 200)
    {
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