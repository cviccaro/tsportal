
/**
 * Auth Controller
 */
(function() {

	'use strict';

	angular
		.module('tsportal.login')
		.controller('LoginController', LoginController);

	function LoginController($rootScope, $scope, $state, authService, $timeout, promisedCache) {

		var vm = this;

		vm.cache = promisedCache;
		vm.rememberMe = false;
		vm.login = login;

		activate();

		////////

		function activate() {
			if (vm.cache.get('rememberMe') && vm.cache.get('email')) {
				vm.rememberMe = vm.cache.get('rememberMe');
				vm.email = vm.cache.get('email');
			}

			// If a token is already stored, try app
			if (authService.hasToken()) {
				$state.go('tradeshows');
			}
		}

		/**
		 * Use authService to login
		 * @return {[void]}
		 */
		function login() {
			var credentials = {
				email: vm.email,
				password: vm.password
			};

			// Provided by messagesDirective
			vm.purgeMessages();

			authService.login(credentials)
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
