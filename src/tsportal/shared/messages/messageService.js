/**
 * Message service
 */

(function() {

	'use strict';

	angular
		.module('tsportal.messages')
		.factory('messageService', messageService);

	function messageService($timeout, $q) {
		var messages = [];

		var service = {
			addMessage: addMessage,
			getMessages: getMessages,
			purge: purge,
			removeMessage: removeMessage
		};

		return service;

		/////////

		function addMessage(config) {
			config.id = messages.length + 1;
			messages.push(config);
			return config;
		}


		function getMessages() {
			return messages;
		}

		function removeMessage(id) {
			if (messages[id - 1]) {
				messages.splice(id - 1, 1);
			}
		}

		function purge() {
			messages = [];
		}
	}
})();
