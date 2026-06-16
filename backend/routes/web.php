<?php

use Core\Router;

Router::get('/users', 'UserController@index');
Router::get('/users/show', 'UserController@show');
Router::post('/users/update-photo', 'UserController@updatePhoto');
Router::post('/users/update-name', 'UserController@updateName');
Router::post('/users/change-password', 'UserController@changePassword');
Router::post('/users/send-reset-code', 'UserController@sendResetCode');
Router::post('/users/reset-password', 'UserController@resetPassword');
Router::post('/users/delete-account', 'UserController@deleteAccount');
Router::get('/profile', 'UserController@profile');

Router::get('/ai-tools', 'AiToolController@index');
Router::get('/filters', 'AiToolController@getFilters');

// nourddine : 11-May-26
Router::get('/playlists', 'PlaylistController@index');
Router::get('/playlists/content', 'PlaylistController@getContent');
Router::post('/playlists/create', 'PlaylistController@create');
Router::post('/playlists/update', 'PlaylistController@update');
Router::post('/playlists/delete', 'PlaylistController@delete');
Router::post('/playlists/add-tool', 'PlaylistController@addTool');
Router::post('/playlists/remove-tool', 'PlaylistController@removeTool');
Router::get('/playlists/check-saved', 'PlaylistController@checkSaved');

Router::get('/users/create', 'UserController@create');
Router::post('/users/create', 'UserController@create');
// zakariae : signup 01-May-26
Router::post('/signup', 'AuthController@signup');
Router::post('/verify-code', 'AuthController@verifyCode');
Router::get('/ai-tools/show', 'AiToolController@show');
Router::get('/ai-tools-detail', 'AiToolController@show');
Router::get('/ai-tools/featured', 'AiToolController@getFeatured'); # zakariae : 16-May-26
Router::post('/ai-tools/suggest', 'AiToolController@suggest');


// Routes pour les détails des AI Tools
Router::get('/ai-tools/{id}', 'AiToolDetailsController@show');
Router::get('/ai-tools/{id}/advantages', 'AiToolDetailsController@getAdvantagesOnly');
Router::get('/ai-tools/{id}/disadvantages', 'AiToolDetailsController@getDisadvantagesOnly');
Router::get('/ai-tools/{id}/pricing', 'AiToolDetailsController@getPricing');
Router::get('/ai-tools/{id}/reviews', 'AiToolDetailsController@getReviewsOnly');
Router::post('/ai-tools/{id}/reviews', 'AiToolDetailsController@addReview');
Router::post('/ai-tools/reviews', 'AiToolDetailsController@addReview');
Router::post('/ai-tools/reviews/update', 'AiToolDetailsController@updateReview');
Router::post('/ai-tools/reviews/delete', 'AiToolDetailsController@deleteReview');
Router::get('/ai-tools/{id}/statistics', 'AiToolDetailsController@getStatisticsOnly');

// meriem : login 08-May-26
Router::post('/login', 'AuthController@login');
Router::post('/logout', 'AuthController@logout');

// zakariae : 8-May-26
Router::get('/status', 'AuthController@status');

// meriem : forgot password 08-May-26
Router::post('/forgot-password', 'AuthController@forgotPassword');
Router::post('/forgot-password/verify', 'AuthController@forgotPasswordVerify');
Router::post('/reset-password', 'AuthController@resetPassword');

// zakariae : 24-May-26 
Router::get('/admincategorie', 'AdminCategorieController@index');
Router::get('/admincategorie/show/{id}', 'AdminCategorieController@show');
Router::post('/admincategorie/create', 'AdminCategorieController@store');
Router::post('/admincategorie/update', 'AdminCategorieController@update');
Router::post('/admincategorie/delete', 'AdminCategorieController@destroy');

// zakariae : 01-Jun-26
Router::get('/admincharacteristic', 'AdminCharacteristicController@index');
Router::get('/admincharacteristic/show', 'AdminCharacteristicController@show');
Router::post('/admincharacteristic/create', 'AdminCharacteristicController@store');
Router::post('/admincharacteristic/update', 'AdminCharacteristicController@update');
Router::post('/admincharacteristic/delete', 'AdminCharacteristicController@destroy');

// zakariae : 01-Jun-26 - Comments and Suspension Moderation
Router::get('/admin/reviews', 'AdminReviewController@index');
Router::post('/admin/reviews/approve', 'AdminReviewController@approve');
Router::post('/admin/reviews/delete', 'AdminReviewController@destroy');
// zakariae : 01-Jun-26 - User Management
Router::post('/admin/users/suspend', 'UserController@suspend');
Router::post('/admin/users/unsuspend', 'UserController@unsuspend');
Router::post('/admin/users/change-role', 'UserController@changeRole');
Router::post('/admin/users/delete', 'UserController@delete');

// Gestion Admin AI Tools
Router::get('/adminaitool', 'AdminAiToolController@index');
Router::get('/adminaitool/show', 'AdminAiToolController@show');
Router::post('/adminaitool/create', 'AdminAiToolController@store');
Router::post('/adminaitool/update', 'AdminAiToolController@update');
Router::post('/adminaitool/delete', 'AdminAiToolController@destroy');


// IA Sprint 3 routes
Router::post('/ai/chat', 'AiController@chat');

// Routes pour les suggestions d'outils IA et parametres (Youssef & Integration)
Router::get('/suggestions/form-data', 'SuggestionController@getFormData');
Router::post('/suggestions', 'SuggestionController@submit');
Router::post('/suggestions/autofill', 'SuggestionController@autofill');
Router::get('/suggestions/pending', 'SuggestionController@getPending');
Router::post('/suggestions/update', 'SuggestionController@update');
Router::post('/suggestions/approve', 'SuggestionController@approve');
Router::post('/suggestions/reject', 'SuggestionController@reject');
Router::get('/admin/settings', 'SuggestionController@getSettings');
Router::post('/admin/settings', 'SuggestionController@updateSettings');
//meriem : gestion modele
Router::get('/adminmodele', 'AdminModeleController@index');
Router::get('/adminmodele/show', 'AdminModeleController@show');
Router::post('/adminmodele/create', 'AdminModeleController@store');
Router::post('/adminmodele/update', 'AdminModeleController@update');
Router::post('/adminmodele/delete', 'AdminModeleController@destroy');

Router::get('/adminprovider', 'AdminProviderController@index');
Router::get('/providers', 'AdminProviderController@index');
Router::get('/adminprovider/show', 'AdminProviderController@show');
Router::post('/adminprovider/create', 'AdminProviderController@store');
Router::post('/adminprovider/update', 'AdminProviderController@update');
Router::post('/adminprovider/delete', 'AdminProviderController@destroy');
?>