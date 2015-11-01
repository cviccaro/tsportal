<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$app->get('/', function() use ($app) {
    return view('angular');
});

$app->group(['prefix' => 'api'], function($app) {
    $app->post('authenticate', 'App\Http\Controllers\Auth\ApiAuthController@authenticate');
    $app->get('authenticate/refresh','App\Http\Controllers\Auth\ApiAuthController@refresh');
});

$app->group(['middleware' => 'jwt.auth', 'prefix' => 'api/tradeshows'], function($app) {
    $app->get('/', 'App\Http\Controllers\TradeshowController@index');
    $app->get('/{id}', 'App\Http\Controllers\TradeshowController@show');
    $app->get('/{id}/leads', 'App\Http\Controllers\LeadController@showByTradeshowId');

    $app->post('/create', 'App\Http\Controllers\TradeshowController@create');
    $app->post('/{id}', 'App\Http\Controllers\TradeshowController@update');
    $app->delete('/{id}', 'App\Http\Controllers\TradeshowController@destroy');
});

$app->group(['middleware' => 'jwt.auth', 'prefix' => 'api/leads'], function($app) {
    $app->get('/', 'App\Http\Controllers\LeadController@index');
    $app->get('/{id}', 'App\Http\Controllers\LeadController@show');

    $app->post('/create', 'App\Http\Controllers\LeadController@createMany');
    $app->post('/{id}', 'App\Http\Controllers\LeadController@update');

    $app->delete('/{id}', 'App\Http\Controllers\LeadController@destroy');
});

