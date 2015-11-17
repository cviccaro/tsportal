/**
 * Busy Indicator Service
 */

(function() {

	'use strict';

	angular
		.module('tsportal.busyIndicator')
		.provider('busyService', busyServiceProvider);
	function busyServiceProvider() {
		this.setApiPattern = function setApiPattern(pattern) {
			this.apiPattern = pattern;
		}
		this.apiPattern = /\/{0,1}api\/[a-zA-Z\/0-9\?\=\&\%\+\-\_]*/g;
		this.$get = busyService;

		return this;

		/////////
		
		function busyService($rootScope, $timeout) {
			var message = 'Working on it', timer, amIBusy = false, hiddenByForce = false;

			var service = {
				apiPattern: this.apiPattern,
				defaultMessage: message,
				forceHide: forceHide,
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

			function forceHide(reset) {
				hiddenByForce = !reset;
			}

			function getMessage(msg) {
				return message;
			}

			function hide() {
				amIBusy = false;
			}

			function isBusy() {
				return amIBusy && !hiddenByForce;
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
	}
})();
