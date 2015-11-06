/**
 * Create a Tradeshow Controller
 * @class TradeshowCreateController
 *--------------------------------------
 * Displays a form for the creation of a new tradeshow
 */

(function() {

	'use strict';

	angular
		.module('tradeshowControllers')
		.controller('TradeshowCreateController', TradeshowCreateController);

	function TradeshowCreateController($scope, $timeout, $state, $stateParams, ngDialog, Tradeshow, loginService, busyService, messageService) {
		var vm = this;

		vm.goBack = goBack;
		vm.save = save;
		vm.validate = validate;

		vm.isNew = true;
		vm.model = "tradeshow";
		vm.submitted = false;
		vm.titlePrefix = "Creating new";
		vm.tradeshow = {};

		/////////

		/**
		 * Callback to 'Back' button
		 */
		function goBack() {
			$state.go("tradeshows");
		}

		/**
		 * Save the new tradeshow using the Tradeshow resource
		 */
		function save() {
			if (vm.validate()) {
				// Alter the working message
				busyService.setMessage('Saving new');

				// Collect 'active' value if it is not set
				if (!vm.tradeshow.hasOwnProperty('active')) {
					vm.tradeshow.active = $('input[name="active"]')[0].checked;
				}

				// Create Tradeshow using Tradeshow resource
				Tradeshow
					.create(vm.tradeshow)
					.$promise
					.then(function(payload) {
						var tradeshow_id = payload.id;

						// Show a confirmation dialog
						ngDialog.open({
							plain: true,
							className: 'dialog-save ngdialog-theme-default',
							template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Your new tradeshow has been created successfully.' +
							'  Close this message box to proceed to the tradeshow\'s edit page.</span>'
						})
						.closePromise
						.then(function(data) {
							// Navigate to the new tradeshow's Edit page on dialog close
							window.location.hash = '#/tradeshows/' + tradeshow_id + '/edit';
						});
					})
					.catch(function(payload) {
						messageService.addMessage({
							type: 'danger',
							dismissible: true,
							icon: 'exclamation-sign',
							iconClass: 'icon-medium',
							message: "Sorry, something went wrong.",
						});
					});
			}
		}
		/**
		 * Validate the form
		 */
		function validate() {
			vm.submitted = true;
			return !( vm.tradeshowForm.name.$invalid || vm.tradeshowForm.location.$invalid );
		}

		/////////

		// No token, no access
		loginService.checkApiAccess();
	}
})();
