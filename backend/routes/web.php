<?php

use Core\Router;

Router::get('/users', 'UserController@index');
Router::get('/ai-tools', 'AiToolController@index');
Router::get('/filters', 'AiToolController@getFilters');
Router::get('/users/create', 'UserController@create');
Router::post('/users/create', 'UserController@create');
Router::get('/ai-tools/{id}', 'AiToolController@show'); 
Router::get('/ai-tools/show', 'AiToolController@show');
Router::get('/ai-tools-detail', 'AiToolController@show');


// Routes pour les détails des AI Tools
Router::get('/ai-tools/{id}', 'AiToolDetailsController@show');
Router::get('/ai-tools/{id}/advantages', 'AiToolDetailsController@getAdvantagesOnly');
Router::get('/ai-tools/{id}/disadvantages', 'AiToolDetailsController@getDisadvantagesOnly');
Router::get('/ai-tools/{id}/pricing', 'AiToolDetailsController@getPricing');
Router::get('/ai-tools/{id}/reviews', 'AiToolDetailsController@getReviewsOnly');
Router::post('/ai-tools/{id}/reviews', 'AiToolDetailsController@addReview');
Router::get('/ai-tools/{id}/statistics', 'AiToolDetailsController@getStatisticsOnly');

?>