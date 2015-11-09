
/**
 * Auth Controller
 */
(function() {

	'use strict';

	angular
		.module('authControllers')
		.controller('AuthController', AuthController);

	function AuthController($rootScope, $scope, $state, loginService, $timeout, CacheFactory) {

		var vm = this;

		vm.cache = null;
		vm.rememberMe = false;
		vm.login = login;

		activate();

		////////

		function activate() {
			if (!CacheFactory.get('loginForm')) {
				new CacheFactory('loginForm', {
					maxAge: 60 * 60 * 24 * 7 * 4 * 1000,
					deleteOnExpire: 'aggressive',
					storageMode: 'localStorage'
				});
			}

			vm.cache = CacheFactory.get('loginForm');
			
			if (vm.cache.get('rememberMe') && vm.cache.get('email')) {
				vm.rememberMe = vm.cache.get('rememberMe');
				vm.email = vm.cache.get('email');
			}

			// If a token is already stored, try app
			if (loginService.hasToken()) {
				$state.go('tradeshows');
			}
		}

		/**
		 * Use loginService to login
		 * @return {[void]}
		 */
		function login() {
			var credentials = {
				email: vm.email,
				password: vm.password
			};

			// Provided by messagesDirective
			vm.purgeMessages();

			loginService.login(credentials)
				.then(function(payload) {
					if (vm.rememberMe) {
						vm.cache.put('email', vm.email);
						vm.cache.put('rememberMe', vm.rememberMe);
					}
					$state.go("tradeshows");
				})
				.catch(function(payload) {
					// Provided by messagesDirective
					vm.addErrorMessage({
						message: 'The email or password entered was incorrect.'
					});
				});
		}
	}

})();
