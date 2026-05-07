<?php

use Core\Router;

Router::get('/users', 'UserController@index');
Router::get('/ai-tools', 'AiToolController@index');
Router::get('/filters', 'AiToolController@getFilters');
Router::get('/users/create', 'UserController@create');
Router::post('/users/create', 'UserController@create');

// zakariae : signup 01-May-26
Router::post('/signup','AuthController@signup');
Router::post('/verify-code','AuthController@verifyCode');

// meriem : login 08-May-26
Router::post('/login', 'AuthController@login');
Router::post('/logout', 'AuthController@logout');

// meriem : forgot password 08-May-26
Router::post('/forgot-password', 'AuthController@forgotPassword');
Router::post('/forgot-password/verify', 'AuthController@forgotPasswordVerify');
Router::post('/reset-password', 'AuthController@resetPassword');



?>