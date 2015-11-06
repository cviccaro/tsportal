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

$app->group(['prefix' => 'api', 'namespace' => 'App\Http\Controllers'], function($app) {
    $app->post('authenticate', 'Auth\ApiAuthController@authenticate');
    $app->get('authenticate/refresh','Auth\ApiAuthController@refresh');
});

$app->group(['middleware' => 'jwt.auth', 'prefix' => 'api/tradeshows', 'namespace' => 'App\Http\Controllers'], function($app) {
    $app->get('/', 'TradeshowController@index');
    $app->get('/{id}', 'TradeshowController@show');
    $app->get('/{id}/leads', 'LeadController@showByTradeshowId');

    $app->post('/create', 'TradeshowController@create');
    $app->post('/{id}', 'TradeshowController@update');
    $app->delete('/{id}', 'TradeshowController@destroy');

    $app->get('/{id}/report', 'ReportingController@report');
});

$app->group(['middleware' => 'jwt.auth', 'prefix' => 'api/leads', 'namespace' => 'App\Http\Controllers'], function($app) {
    $app->get('/', 'LeadController@index');
    $app->get('/{id}', 'LeadController@show');

    $app->post('/create', 'LeadController@createMany');
    $app->post('/{id}', 'LeadController@update');

    $app->delete('/{id}', 'LeadController@destroy');
});

