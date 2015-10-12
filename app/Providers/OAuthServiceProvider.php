<?php

namespace TSPortal\Providers;

use Dingo\Api\Auth\Auth;
use Dingo\Api\Auth\Provider\OAuth2;
use Illuminate\Support\ServiceProvider;

class OAuthServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->app[Auth::class]->extend('oauth', function ($app) {
            $provider = new OAuth2($app['oauth2-server.authorizer']->getChecker());

            $provider->setClientResolver(function ($id) {
                // Logic to return a client by their ID.
                $client = DB::table('oauth_clients')->where('id', $id)->get();
                return $client;
            });

            return $provider;
        });
    }

    public function register()
    {
        //
    }
}