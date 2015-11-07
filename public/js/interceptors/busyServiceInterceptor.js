(function() {

    'use strict';

    angular.module('busyService')
        .config(function($httpProvider) {
            $httpProvider.interceptors.push(busyServiceInterceptor);
        });

    function busyServiceInterceptor(busyService, $q) {

        var apiPattern = /\/{0,1}api\/[a-zA-Z\/0-9\?\=\&\%\+\-\_]*/g;

        return {
            request: function(config) {
                if (config.url.match(apiPattern)) {
                    busyService.show();
                }
                return config;
            },
            response: function(response) {
                if (response.config.url.match(apiPattern)) {
                    busyService.hide();
                }
                return response;
            },
            responseError: function(rejection) {
                if (rejection.config.url.match(apiPattern)) {
                    busyService.hide();
                }
                return $q.reject(rejection);
            }
        };
    }
})();