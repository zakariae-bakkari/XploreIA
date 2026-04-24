<?php

use Core\Router;

Router::get('/users', 'UserController@index');
Router::get('/ai-tools', 'AiToolController@index');
Router::get('/filters', 'AiToolController@getFilters');
Router::get('/users/create', 'UserController@create');
Router::post('/users/create', 'UserController@create');

?>