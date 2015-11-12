(function() {

	'use strict';

	angular.module('tsportal.login')
	.controller('LogoutController', LogoutController);

	function LogoutController(authService) {
		authService.logout();
	}
})();
