
/**
 * Auth Controller
 */
(function() {

	'use strict';

	angular
		.module('authControllers')
		.controller('AuthController', AuthController);

	function AuthController($rootScope, $scope, $state, loginService, busyService, messageService) {
	
		var vm = this;

		vm.clearErrors = clearErrors;
		vm.login = login;
		vm.loginError = loginError;

		////////

		/**
		 * Clear errors
		 * @return {[void]}
		 */
		function clearErrors() {
			if (vm.messages.length) {
				for (var i = 0, msg; (msg = vm.messages[i]); i++) {
					messageService.removeMessage(msg.id);
				}
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
		
			loginService.login(credentials)
				.then(function(payload) {
					$state.go("tradeshows");
				})
				.catch(function(payload) {
					vm.loginError();
				});
		}

		/**
		 * Show a login error
		 * @return {[void]}
		 */
		function loginError() {
			messageService.purge();
			messageService.addMessage({
				type: 'danger',
				icon: 'exclamation-sign',
				message: 'The email or password entered was incorrect.',
				dismissible: true,
				iconClass: '',
			});
		}

		/////////
		
		// If a token is already stored, try app
		loginService.checkApiAccess().then(function() {
			$state.go("tradeshows");
		});
	}

})();
