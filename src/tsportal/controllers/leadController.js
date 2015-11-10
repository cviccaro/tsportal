/**
 * Edit Lead Controller
 * @class LeadController
 */

(function() {

	'use strict';

	angular
		.module('leadControllers', [])
		.controller('LeadController', LeadController);

	function LeadController($scope, $q, $http, $state, $stateParams, ngDialog, Lead, Tradeshow, busyService, messageService, leadData,$timeout, $log) {

		var vm = this;

		vm.goBack = goBack;
		vm.save = save;

		vm.lead = leadData;
		vm.title = 'Editing Lead';

		activate();

		/////////

		function activate() {

		}

		/**
		 * [Callback to 'Back' button]
		 *
		 * @return {[void]}
		 */
		function goBack() {
			$state.go('tradeshowEdit', {id: vm.lead.tradeshow_id});
		}

		/**
		 * Save the Lead
		 *
		 * @return {[void]}
		 */
		function save() {
			if (vm.leadForm.$valid) {
				// Alter the working message
				busyService.setMessage('Saving');

				// Save the Lead using the Lead resource
				Lead.
					save(vm.lead).
					$promise.
					then(function(payload) {
						vm.lead = payload;

						vm.addSuccessMessage();

						$http.defaults.cache.removeAll();
					})
					.catch(function(payload) {
						vm.addErrorMessage();
					});
			}
		}
	}
})();
