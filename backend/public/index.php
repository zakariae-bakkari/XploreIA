<?php
// ========== HEADERS CORS (à mettre ABSOLUMENT au début) ==========
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Répondre immédiatement aux requêtes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ========== FIN DES HEADERS CORS ==========

// Activation des erreurs pour le développement
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Simple Autoloader
spl_autoload_register(function ($class) {
    $root = dirname(__DIR__);
    $class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    
    // Check in 'app' and 'core'
    $file = $root . DIRECTORY_SEPARATOR . $class . '.php';
    
    // Adjust for App/Controllers -> app/controllers (case sensitivity on some systems)
    $file = str_replace('App' . DIRECTORY_SEPARATOR, 'app' . DIRECTORY_SEPARATOR, $file);
    $file = str_replace('Core' . DIRECTORY_SEPARATOR, 'core' . DIRECTORY_SEPARATOR, $file);

    if (file_exists($file)) {
        require $file;
    }
});

use Core\Router;

// Load routes
require_once __DIR__ . '/../routes/web.php';

// Nettoyer l'URL
$request_uri = $_SERVER['REQUEST_URI'];
if (($pos = strpos($request_uri, '?')) !== false) {
    $request_uri = substr($request_uri, 0, $pos);
}

// Dispatch request
Router::dispatch($request_uri);