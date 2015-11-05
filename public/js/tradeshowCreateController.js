'use strict';

/**
 * Create a Tradeshow Controller
 * @class TradeshowCreateController
 *--------------------------------------
 * Displays a form for the creation of a new tradeshow
 */
angular
.module('tradeshowControllers')
.controller('TradeshowCreateController',
	function TradeshowCreateController($rootScope, $scope, Tradeshow, $stateParams, ngDialog, $state, loginService, busyService, messageService, $timeout) {
		// Scope variables
		$scope.isNew = true;
		$scope.model = 'tradeshow';
		$scope.titlePrefix = 'Creating new';
		$scope.tradeshow = {};
		$scope.submitted = false;

		/**
		 * Callback to 'Back' button
		 *
		 * @return {[void]}
		 */
		$scope.goBack = function() {
			$state.go('tradeshows');
		};

		/**
		 * Save the new tradeshow using the Tradeshow resource
		 *
		 * @return {[void]}
		 */
		$scope.save = function() {
			if ($scope.validate()) {
				// Alter the working message, show working indicator
				busyService.setMessage('Saving new');
				busyService.show();

				// Collect 'active' value if it is not set
				if (!$scope.tradeshow.hasOwnProperty('active')) {
					$scope.tradeshow.active = $('input[name="active"]')[0].checked;
				}

				// Create Tradeshow using Tradeshow resource
				Tradeshow
					.create($scope.tradeshow)
					.$promise
					.then(function(payload) {
						var tradeshow_id = payload.id;

						// Fade out the "busy" indicator
						busyService.hide();

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
						busyService.hide();
						messageService.addMessage({
							type: 'danger',
							dismissible: true,
							icon: 'exclamation-sign',
							iconClass: 'icon-medium',
							message: "Sorry, something went wrong.",
						});
					});
			}
		};
		/**
		 * Validate the form
		 */
		$scope.validate = function() {
			$scope.submitted = true;
			return !( $scope.tradeshowForm.name.$invalid || $scope.tradeshowForm.location.$invalid );
		};

		// No token, no access
		loginService.checkApiAccess().then(function() {
			// Ensure "busy" indicator is hidden
			$timeout(function() {
				busyService.hide();
			},100);
		});
	}
);