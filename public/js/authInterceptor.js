/**
 * Auth Interceptor
 * 	@credit : largely modified from http-auth-interceptor package
 */

(function() {

	'use strict';

	angular
		.module('authInterceptor',[])
		.factory('httpBuffer', httpBuffer)
		.config(function($httpProvider) {
			$httpProvider.interceptors.push(authInterceptor);
		});
	
	function httpBuffer($injector) {
		var buffer = [];

		var $http;

		function retryHttpRequest(config, deferred) {
		  function successCallback(response) {
		    deferred.resolve(response);
		  }
		  function errorCallback(response) {
		    deferred.reject(response);
		  }
		  $http = $http || $injector.get('$http');
		  $http(config).then(successCallback, errorCallback);
		}

		return {
		  /**
		   * Appends HTTP request configuration object with deferred response attached to buffer.
		   */
		  append: function(config, deferred) {
		    buffer.push({
		      config: config,
		      deferred: deferred
		    });
		  },

		  /**
		   * Abandon or reject (if reason provided) all the buffered requests.
		   */
		  rejectAll: function(reason) {
		    if (reason) {
		      for (var i = 0; i < buffer.length; ++i) {
		        buffer[i].deferred.reject(reason);
		      }
		    }
		    buffer = [];
		  },

		  /**
		   * Retries all the buffered requests clears the buffer.
		   */
		  retryAll: function(updater) {
		    for (var i = 0; i < buffer.length; ++i) {
		      retryHttpRequest(updater(buffer[i].config), buffer[i].deferred);
		    }
		    buffer = [];
		  }
		};
	}

	function authInterceptor ($injector, $rootScope, $q, httpBuffer, busyService) {
		// Will get resolved later using $injector to avoid circular dependency issues
		var loginService, ngDialog;

		return {
			request: function(config) {
				busyService.show();
				// Append the token to any request that isn't to login URL or doesn't have a token set
				if (config.url != '/api/authenticate' && !config.headers.hasOwnProperty('Authorization')) {
					loginService = loginService || $injector.get('loginService');

					config.headers.Authorization = 'Bearer ' + loginService.token.get();
				}

				return config;
			},
			response: function(response) {
				var config 	 = response.config;

				// Intercept and snatch a successful token from the HTTP response
				if (config.url == '/api/authenticate' && config.method == "POST" && response.status == 200) {
					loginService = loginService || $injector.get('loginService');

					if (response.data.hasOwnProperty('token')) {
						loginService.token.set(response.data.token);
						loginService.loginConfirmed();
					}
				}
				
				busyService.hide();

				return response;
			},
			responseError: function(rejection) {
				var deferred = $q.defer();

				loginService = loginService || $injector.get('loginService');

				switch (rejection.status) {
				  case 401:
				  	// If token is expired, refresh it
				  	if (rejection.data.hasOwnProperty('error') && rejection.data.error == 'token_expired') {
					    httpBuffer.append(rejection.config, deferred);
					    $rootScope.$broadcast('event:auth-login-required', rejection);
					    if (loginService.hasToken()) {
						    loginService.refresh();
					    }
					    return deferred.promise;
					}
				    break;
				  case 403:
				    $rootScope.$broadcast('event:auth-forbidden', rejection);
				    loginService.loginCancelled();
				    break;
			      case 500:
			      	ngDialog = ngDialog || $injector.get('ngDialog');
					ngDialog.open({
						plain: true,
						className: 'dialog-save ngdialog-theme-default',
						template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>Sorry, something went wrong.  Try again later.</span>'
					});
			      	break;
				}

				busyService.hide();

				deferred.reject(rejection);

				return deferred.promise;
			}
		};
	}

})();
