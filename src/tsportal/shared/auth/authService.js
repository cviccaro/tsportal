/**
 * Login Service
 */

(function() {

	'use strict';

	angular
		.module('tsportal.auth')
		.factory('authService', authService);

	function authService($state, $rootScope, $q, CacheFactory, $http, httpBuffer, $injector) {
		var cache;

		var service = {
			checkApiAccess: checkApiAccess,
			hasToken: hasToken,
			isValidEmail: isValidEmail,
			login: login,
			loginCancelled: loginCancelled,
			loginConfirmed: loginConfirmed,
			logout: logout,
			refresh: refresh,
			token: {
				get: tokenGet,
				set: tokenSet,
				remove: tokenRemove
			}
		};

		activate();

		return service;

		/////////

		function activate() {
			if (!CacheFactory.get('authCache')) {
				new CacheFactory('authCache', {
					maxAge: 60 * 59 * 1000,
					deleteOnExpire: 'aggressive',
					storageMode: 'localStorage',
					onExpire: function(key, value) {
						var svc = $injector.get('authService');
						svc.refresh(value).then(function(payload) {
							cache.put(key, payload.data.token);
						});
					}
				});
			}
			cache = CacheFactory.get('authCache');

			$rootScope.isLoggedIn = cache.get('token') !== undefined;
		}

		function checkApiAccess() {
			var deferred = $q.defer();
			if (this.hasToken()) {
				$rootScope.isLoggedIn = true;
				deferred.resolve();
			}
			else {
				this.loginCancelled();
				deferred.reject();
			}
			return deferred.promise;
		}

		function hasToken() {
			var t = this.token.get();
			return t !== undefined && t !== null;
		}

		function isValidEmail(email) {
			var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		    return pattern.test(email);
		}

		function login(credentials) {
			var deferred = $q.defer();

			$http.post('/api/authenticate', credentials, {cache: false})
				.then(function(payload) {
					deferred.resolve(payload);
				})
				.catch(function(payload) {
					deferred.reject(payload);
				});
			return deferred.promise;
		}

		function loginCancelled(data,reason) {
			httpBuffer.rejectAll(reason);
			$rootScope.$broadcast('event:auth-login-cancelled', data);
			this.logout();
		}

		function loginConfirmed(data, configUpdater) {
			var updater = configUpdater || function(config) {return config;};
			$rootScope.$broadcast('event:auth-logged-in', data);
			$rootScope.isLoggedIn = true;
			httpBuffer.retryAll(updater);
		}

		function logout() {
			this.token.remove();
			$state.go('auth');
		}

		function refresh(tokenString) {
			var deferred = $q.defer(),
				that 	= this,
				config 	= {cache: false, headers: {}};

			if (typeof tokenString !== "undefined") {
				config.headers.Authorization = "Bearer " + tokenString;
			}

			$http.get('api/authenticate/refresh', config)
			.then(function(payload) {
				that.token.set(payload.data.token);
				that.loginConfirmed();
				deferred.resolve(payload);
			})
			.catch(function(payload) {
				that.loginCancelled();
				deferred.reject(payload);
			});
			return deferred.promise;
		}

		function tokenGet() {
			return cache.get('token');
		}

		function tokenRemove() {
			cache.remove('token');
		}

		function tokenSet(tokenString) {
			cache.put('token', tokenString);
		}
	}
})();
