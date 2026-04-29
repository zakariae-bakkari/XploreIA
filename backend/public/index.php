<?php

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple Autoloader
spl_autoload_register(function ($class) {
    $root = dirname(__DIR__);
    $class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    
    // Check in 'app' and 'core'
    $file = $root . DIRECTORY_SEPARATOR . $class . '.php';
    
    // Adjust for App/Controllers -> app/controllers (case sensitivity on some systems)
    // Here we assume standard PSR-4 like structure
    $file = str_replace('App' . DIRECTORY_SEPARATOR, 'app' . DIRECTORY_SEPARATOR, $file);
    $file = str_replace('Core' . DIRECTORY_SEPARATOR, 'core' . DIRECTORY_SEPARATOR, $file);

    if (file_exists($file)) {
        require $file;
    }
});

use Core\Router;
use Core\DotEnv;

// Load environment variables
DotEnv::load(__DIR__ . '/../.env');

// Load routes
require_once __DIR__ . '/../routes/web.php';

// Dispatch request
Router::dispatch();
