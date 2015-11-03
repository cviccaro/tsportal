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

$app->get('/test', function() use ($app) {
    $factory = Faker\Factory::create();
    $lead = [
        'first_name' => $factory->firstName,
        'last_name' => $factory->lastName,
        'title' => $factory->title,
        'department' => $factory->randomElement(['Management', 'IT', 'Marketing', 'Engineering']),
        'event_type' => $factory->randomElement(['Demo', 'Meeting', 'Assembly']),
        'purpose_of_visit' => $factory->randomElement(['Purchase', 'Meeting', 'Tour']),
        'date_next_appointment' => $factory->dateTimeThisYear()->format('m-d-Y'),
        'representative_name' => $factory->name,
        'company_name' => $factory->company,
        'address1' => $factory->streetAddress,
        'city' => $factory->city,
        'state' => $factory->state,
        'country' => 'US',
        'zip_code' => $factory->postcode,
        'udid' => $factory->uuid,
        'email_address' => $factory->email,
        'company_email_address' => $factory->companyEmail,
        'phone_number' => $factory->phoneNumber,
        'existing_customer' => $factory->numberBetween(0,1),
        'contact_by_phone' => $factory->numberBetween(0,1),
        'contact_by_email' => $factory->numberBetween(0,1),
        'notes' => $factory->realText(),
        'timestamp' => time(),
        'tradeshow_id' => $factory->numberBetween(1,200)
    ];
    d($lead);
    return '';
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

