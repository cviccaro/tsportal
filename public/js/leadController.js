/**
 * Edit Lead Controller
 * @class LeadController
 */

(function() {

	'use strict';

	angular
		.module('leadControllers')
		.controller('LeadController', LeadController);

	function LeadController($scope, $q, $state, $stateParams, ngDialog, Lead, Tradeshow, loginService, busyService, messageService) {

		var vm = this;

		vm.getLead = getLead;
		vm.goBack = goBack;
		vm.save = save;
		vm.validate = validate;

		vm.model = 'lead';
		vm.submitted = false;
		vm.title = 'Editing Lead';

		/////////
		
		/**
		 * Get the lead
		 * @return {[$q promise]}
		 */
		function getLead() {
			var deferred = $q.defer();

			Lead.
				get({id:$stateParams.id}).
				$promise.
				then(function(payload) {
					vm.lead = payload;
					angular.forEach(['existing_customer', 'contact_by_phone', 'contact_by_email'], function(key) {
						if (vm.lead[key] == 1) {
							$('input[name="' + key + '"]').bootstrapSwitch('state', true);
						}
					});
					Tradeshow.
						get({tradeshowId: vm.lead.tradeshow_id}).
						$promise.
						then(function(payload) {
							vm.tradeshow = payload;
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
		}

		/**
		 * [Callback to 'Back' button]
		 *
		 * @return {[void]}
		 */
		function goBack() {
			window.history.back();
		}

		/**
		 * Save the Lead
		 *
		 * @return {[void]}
		 */
		function save() {
			if (vm.validate()) {
				// Alter the working message
				busyService.setMessage('Saving');

				// Save the Lead using the Lead resource
				Lead.
					save(vm.lead).
					$promise.
					then(function(payload) {
						// Set the lead in scope
						vm.lead = payload;

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
		 * @return {[bool]} is validated
		 */
		function validate() {
			vm.submitted = true;
			return ! (vm.leadForm.first_name.$invalid || vm.leadForm.last_name.$invalid);
		}

		/////////

		// Check API Access
		loginService.checkApiAccess().then(function() {
			vm.getLead()
			.then()
			.catch(function(payload) {
				ngDialog.open({
					plain: true,
					className: 'dialog-save ngdialog-theme-default',
					template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>Sorry, something went wrong.  Try again later.</span>'
				});
			});
		});
	}
})();
