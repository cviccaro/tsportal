<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// Root route
Route::get('/', function () {
    return view('angular');
});

/**
 * Web Authentication Routes
 */
Route::get('auth/login', 'Auth\AuthController@getLogin');
Route::post('auth/login', 'Auth\AuthController@postLogin');
Route::get('auth/logout', 'Auth\AuthController@getLogout');

/**
 * API Routes
 */
Route::group(['prefix' => 'api'], function() {
    Route::post('authenticate', 'ApiAuthController@authenticate');
    Route::get('authenticate/refresh','ApiAuthController@refresh');
});

$api = app('Dingo\Api\Routing\Router');

$api->version('v1', ['middleware' => 'api.auth'], function($api) {
    $api->get('tradeshows', 'TSPortal\API\Controllers\TradeshowController@index');
    $api->get('tradeshows/{id}', 'TSPortal\API\Controllers\TradeshowController@show');
    $api->post('tradeshows/create', 'TSPortal\API\Controllers\TradeshowController@store');
    $api->post('tradeshows/{id}', 'TSPortal\API\Controllers\TradeshowController@update');
    $api->delete('tradeshows/{id}', 'TSPortal\API\Controllers\TradeshowController@destroy');
    $api->get('tradeshows/{id}/leads', 'TSPortal\API\Controllers\LeadController@showByTradeshowId');
    $api->get('leads', 'TSPortal\API\Controllers\LeadController@index');
    $api->get('leads/{id}', 'TSPortal\API\Controllers\LeadController@show');
    $api->delete('leads/{id}', 'TSPortal\API\Controllers\LeadController@destroy');
    $api->post('leads/create', 'TSPortal\API\Controllers\LeadController@createMany');
    $api->post('leads/{id}', 'TSPortal\API\Controllers\LeadController@update');
});

Route::get('tradeshows/{tradeshow_id}/report', 'ReportingController@report');

// Emulate old API
// Old API had no authentication so unfortunately API calls using ws.php will not be authenticated
// WS.php support will be phased out in upcoming updates to iOS app

// Route::group(['middleware' => 'jwt.auth'], function() {
	Route::get('ws.php', '\TSPortal\API\Controllers\OldAPIEmulation@handle');
    Route::post('ws.php', '\TSPortal\API\Controllers\OldAPIEmulation@handle');
// });
// 