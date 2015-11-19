/**
 * Create a Tradeshow Controller
 * @class TradeshowCreateController
 *--------------------------------------
 * Displays a form for the creation of a new tradeshow
 */

(function() {

	'use strict';

	angular
		.module('tsportal.tradeshows')
		.controller('TradeshowCreateController', TradeshowCreateController);

	function TradeshowCreateController($scope, $state, ngDialog, Tradeshow, authService, busyService) {
		var vm = this;

		vm.goBack = goBack;
		vm.save = save;

		vm.isNew = true;
		vm.tradeshow = {active: 0};

		activate();

		/////////

		function activate() {
			authService.checkApiAccess();
		}

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
			if (vm.tradeshowForm.$valid) {
				// Alter the working message
				busyService.setMessage('Saving new');

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
							$state.go('tradeshowEdit', {id: tradeshow_id});
						});
					})
					.catch(function(payload) {
						vm.addErrorMessage();
					});
			}
		}
	}
})();
