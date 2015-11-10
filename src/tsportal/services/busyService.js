/**
 * Busy Indicator Service
 */

(function() {

	'use strict';

	angular
		.module('busyService',[])
		.factory('busyService', busyService);

	function busyService($rootScope, $timeout) {
		var message, timer, amIBusy = false;

		var service = {
			defaultMessage: 'Working on it',
			getMessage: getMessage,
			hide: hide,
			isBusy: isBusy,
			isVisible: isVisible,
			resetMessage: resetMessage,
			setMessage: setMessage,
			show: show
		};

		activate();

		return service;

		/////////

		function activate() {
			$rootScope.workingMessage = service.defaultMessage;
		}

		function getMessage(msg) {
			return message;
		}

		function hide() {
			amIBusy = false;
		}

		function isBusy() {
			return amIBusy;
		}

		function isVisible() {
			return $('.loading-indicator').is(':visible');
		}

		function resetMessage() {
			this.setMessage(this.defaultMessage);
		}

		function setMessage(msg) {
			message = $rootScope.workingMessage = msg;
		}

		function show() {
			amIBusy = true;
		}
	}
})();
