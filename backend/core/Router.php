<?php

namespace Core;

class Router {
    private static $routes = [];

    public static function get($path, $callback) {
        self::$routes['GET'][$path] = $callback;
    }

    public static function post($path, $callback) {
        self::$routes['POST'][$path] = $callback;
    }

    public static function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove project subdirectory if necessary (e.g., /XploreIA/backend/public/)
        // This is a simple logic, might need adjustment based on virtual host setup
        $basePath = '/XploreIA/backend/public';
        if (strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        
        if ($path === '' || $path === false) $path = '/';

        if (isset(self::$routes[$method][$path])) {
            $callback = self::$routes[$method][$path];
            
            if (is_string($callback)) {
                $parts = explode('@', $callback);
                $controllerName = "App\\Controllers\\" . $parts[0];
                $methodName = $parts[1];
                
                if (class_exists($controllerName)) {
                    $controller = new $controllerName();
                    if (method_exists($controller, $methodName)) {
                        return $controller->$methodName();
                    }
                }
            }
        }

        // 404 Not Found
        header("HTTP/1.0 404 Not Found");
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Route not found', 'path' => $path]);
        exit;
    }
}