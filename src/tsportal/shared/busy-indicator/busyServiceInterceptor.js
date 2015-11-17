(function() {

    'use strict';

    angular.module('tsportal.busyIndicator')
        .config(function($httpProvider) {
            $httpProvider.interceptors.push(busyServiceInterceptor);
        });

    function busyServiceInterceptor(busyService, $q) {

        var apiPattern = busyService.apiPattern;

        return {
            request: function(config) {
                if (config.url.match(busyService.apiPattern)) {
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