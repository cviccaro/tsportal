
/**
 * Auth Controller
 */
(function() {

	'use strict';

	angular
		.module('authControllers')
		.controller('AuthController', AuthController);

	function AuthController($rootScope, $scope, $state, loginService, $timeout) {

		var vm = this;

		vm.login = login;

		activate();

		////////

		function activate() {
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
