<?php
return [
    'host'     => getenv('DB_HOST'),
    'dbname'   => getenv('DB_NAME'),
    'username' => getenv('DB_USERNAME'),
    'password' => getenv('DB_PASSWORD'),
    'charset'  => 'utf8mb4'
];