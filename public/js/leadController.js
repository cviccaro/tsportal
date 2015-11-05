'use strict';


/**
 * Edit Lead Controller
 * @class LeadController
 */
angular
.module('leadControllers')
.controller('LeadController',
	function LeadController($rootScope, $scope, $stateParams, Lead, ngDialog, Tradeshow, $state, loginService, busyService, messageService, $q) {

		// Scope variables
		$scope.model = 'lead';
		$scope.title = 'Editing Lead';
		$scope.submitted = false;

		// Get the lead using the Lead resource
		$scope.getLead = function() {
			var deferred = $q.defer();
			Lead.
				get({id:$stateParams.id}).
				$promise.
				then(function(payload) {
					$scope.lead = payload;
					angular.forEach(['existing_customer', 'contact_by_phone', 'contact_by_email'], function(key) {
						if ($scope.lead[key] == 1) {
							$('input[name="' + key + '"]').bootstrapSwitch('state', true);
						}
					});
					Tradeshow.
						get({tradeshowId: $scope.lead.tradeshow_id}).
						$promise.
						then(function(payload) {
							$scope.tradeshow = payload;
							deferred.resolve(payload);
						})
						.catch(function(payload) {
							deferred.reject(payload);
						});
				})
				.catch(function(payload) {
					deferred.reject(payload);
				});
			return deferred.promise;
		};

		// Scope methods

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
				// Alter the working message, show working indicator
				busyService.setMessage('Saving');
				busyService.show();

				// Save the Lead using the Lead resource
				Lead.
					save($scope.lead).
					$promise.
					then(function(payload) {
						// Set the lead in scope
						$scope.lead = payload;

						// Manually fade out the "busy" indicator
						busyService.hide();

						// Show success alert
						messageService.addMessage({
							icon: 'ok',
							type: 'success',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Your changes have been saved'
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
		 * @return {[bool]} is validated
		 */
		$scope.validate = function validate() {
			$scope.submitted = true;
			return ! ($scope.leadForm.first_name.$invalid || $scope.leadForm.last_name.$invalid);
		};

		// Check API Access
		loginService.checkApiAccess().then(function() {
			$scope.getLead().then(function() {
				busyService.hide();
			})
			.catch(function(payload) {
				busyService.hide();
				ngDialog.open({
					plain: true,
					className: 'dialog-save ngdialog-theme-default',
					template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>Sorry, something went wrong.  Try again later.</span>'
				});
			});
		});
	}
);