<?php

use Core\Router;

Router::get('/users', 'UserController@index');
Router::post('/users/update-photo', 'UserController@updatePhoto');
Router::post('/users/update-name', 'UserController@updateName');
Router::post('/users/change-password', 'UserController@changePassword');
Router::post('/users/send-reset-code', 'UserController@sendResetCode');
Router::post('/users/reset-password', 'UserController@resetPassword');
Router::post('/users/delete-account', 'UserController@deleteAccount');

Router::get('/ai-tools', 'AiToolController@index');
Router::get('/filters', 'AiToolController@getFilters');

// nourddine : 11-May-26
Router::get('/playlists', 'PlaylistController@index');
Router::get('/playlists/content', 'PlaylistController@getContent');
Router::post('/playlists/create', 'PlaylistController@create');
Router::post('/playlists/update', 'PlaylistController@update');
Router::post('/playlists/delete', 'PlaylistController@delete');

Router::get('/users/create', 'UserController@create');
Router::post('/users/create', 'UserController@create');
// zakariae : signup 01-May-26
Router::post('/signup','AuthController@signup');
Router::post('/verify-code','AuthController@verifyCode');

// meriem : login 08-May-26
Router::post('/login', 'AuthController@login');
Router::post('/logout', 'AuthController@logout');

// zakariae : 8-May-26
Router::get('/status', 'AuthController@status');

// meriem : forgot password 08-May-26
Router::post('/forgot-password', 'AuthController@forgotPassword');
Router::post('/forgot-password/verify', 'AuthController@forgotPasswordVerify');
Router::post('/reset-password', 'AuthController@resetPassword');



?>
