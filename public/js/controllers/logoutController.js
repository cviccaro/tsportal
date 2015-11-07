(function() {

	'use strict';

	angular.module('authControllers')
	.controller('LogoutController', LogoutController);

	function LogoutController(loginService) {
		loginService.logout();
	}
})();
