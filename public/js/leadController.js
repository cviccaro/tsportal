(function($) {
	'use strict';

	var leadControllers = angular.module('leadControllers', ['ngDialog']);
	/**
	 * Edit Lead Controller
	 * @class LeadController
	 */
	leadControllers.controller('LeadController', ['$rootScope', '$scope', '$stateParams', 'Lead', 'ngDialog', 'Tradeshow', '$state', 'jwtRefreshService', function LeadController($rootScope, $scope, $stateParams, Lead, ngDialog, Tradeshow, $state, jwtRefreshService) {

		// Check API Access,refresh token if needed
		jwtRefreshService.checkApiAccess();
		
		// Scope variables
		$scope.model = 'lead';
		$scope.title = 'Editing Lead';
		$scope.submitted = false;

		// Get the lead using the Lead resource
		Lead.
			get({id:$stateParams.id}).
			$promise.
			then(function(payload) {
				$scope.lead = payload.lead;
				$scope.setTitle();
				angular.forEach(['existing_customer', 'contact_by_phone', 'contact_by_email'], function(key) {
					if ($scope.lead[key] == 1) {
						$('input[name="' + key + '"]').bootstrapSwitch('state', true);
					}
				});
				Tradeshow.
					get({tradeshowId: $scope.lead.tradeshow_id}).
					$promise.
					then(function(payload) {
						$scope.tradeshow = payload.tradeshow;
					});
		});

		// Scope methods
		
		/**
		 * Sets the title scope var based on the current lead in scope
		 * 
		 * @return {[void]}
		 */
		$scope.setTitle = function setTitle() {
			$scope.title = 'Editing Lead <em>' + $scope.lead.first_name + ' ' + $scope.lead.last_name + '</em>';
		};

		/**
		 * [Callback to 'Back' button]
		 * 
		 * @return {[void]}
		 */
		$scope.goBack = function goBack() {
			window.history.back();
		};

		/**
		 * Save the Lead
		 * 
		 * @return {[void]}
		 */
		$scope.save = function save() {
			if ($scope.validate()) {
				// Alter the "busy" indicator text to reflect operation
				$rootScope.workingMessage = 'Saving';

				// Manually fade in "busy" indicator
				$('.loading-indicator').removeClass('ng-hide').fadeIn(100);

				// Save the Lead using the Lead resource
				Lead.
					save($scope.lead).
					$promise.
					then(function(payload) {
						// Set the lead in scope
						$scope.lead = payload.lead;

						// Set the page title
						$scope.setTitle();

						// Manually fade out the "busy" indicator
						$('.loading-indicator').fadeOut(100).addClass('ng-hide');

						// Show a confirmation dialog
						ngDialog.open(
							{
								plain: true,
								className: 'dialog-save ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Your changes have been saved.</span>'
							}
						);
					});
			}
		};
		/**
		 * Validate the form
		 * @return {[bool]} is validated
		 */
		$scope.validate = function validate() {
			$scope.submitted = true;
			return ! ($scope.leadForm.first_name.$invalid || $scope.leadForm.last_name.$invalid);
		}

		$rootScope.isLoggedIn = true
	}])
})(jQuery);