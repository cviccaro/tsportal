/**
 * Busy Indicator Service
 */

(function() {

	'use strict';

	angular
		.module('busyService',[])
		.factory('busyService', busyService);

	function busyService($rootScope, $timeout) {
		var message = 'Working on it...', timer;

		$rootScope.workingMessage = message;
		$rootScope.busyServiceIsBusy = true;

		var service = {
			getMessage: getMessage,
			hide: hide,
			isBusy: isBusy,
			isVisible: isVisible,
			setMessage: setMessage,
			show: show
		};

		return service;

		/////////
		
		function getMessage(msg) {
			return message;
		}
		
		function hide() {
			timer = $timeout(function() {
				$rootScope.busyServiceIsBusy = false;
			},100);
		}

		function isBusy() {
			return $rootScope.busyServiceIsBusy;
		}

		function isVisible() {
			return $('.loading-indicator').is(':visible');
		}

		function setMessage(msg) {
			message = $rootScope.workingMessage = msg;
		}

		function show() {
			if (timer) { $timeout.cancel(timer); }
			$rootScope.busyServiceIsBusy = true;
		}
	}
})();
