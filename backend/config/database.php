<?php

return [
    'host'     => getenv('DB_HOST')     ?: 'localhost',
    'dbname'   => getenv('DB_NAME')     ?: 'xplore_ia',
    'username' => getenv('DB_USERNAME') ?: 'root',
    'password' => getenv('DB_PASSWORD') ?: '',
    'charset'  => 'utf8mb4'
];