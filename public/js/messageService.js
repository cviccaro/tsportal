/**
 * Message service
 */

(function() {

	'use strict';

	angular
		.module('messageService', [])
		.factory('messageService', messageService);

	function messageService($timeout, $rootScope) {
		var messages = [];

		function addMessage(opts) {
			opts.id = messages.length + 1;
			messages.push(opts);
			$timeout(function() {
				$('.messages .alert').css('opacity', 1);
			},50);
		}

		function getMessages() {
			return messages;
		}

		function removeMessage(message_id) {
			if (messages[message_id - 1]) {
				messages.splice(message_id - 1, 1);
				// console.log('removing message ', messages[message_id - 1])
				// if (window.navigator.userAgent.match(/PhantomJS/g) !== null) {
				// 	console.log('removing without animation')
				// 	var removed = messages.splice(message_id - 1, 1);
				// }
				// else {
				// 	var el = $('.messages .alert').eq(message_id - 1);
				// 	el.on('transitionend',function() {
				// 		//var removed = messages.splice(message_id - 1, 1);
				// 		console.log({removed: removed, messagesNow: messages})
				// 		$('.messages .alert').eq(message_id - 1).remove();
				// 	})
				// 	$timeout(function() {
				// 		console.log(el)
				// 		//el.css('opacity', 0);
				// 	},500);
				// }
			}
		}

		function purge() {
			if (messages.length) {
				for (var i = 0, msg; (msg = messages[i]); i++) {
					this.removeMessage(msg.id);
				}
			}
		}

		return {
			addMessage: addMessage,
			getMessages: getMessages,
			purge: purge,
			removeMessage: removeMessage
		};
	}
})();
