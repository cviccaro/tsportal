/**
 * Edit Lead Controller
 * @class LeadEditController
 */

(function() {

	'use strict';

	angular
		.module('tsportal.leads')
		.controller('LeadEditController', LeadEditController);

	function LeadEditController($http, $q, $scope, $timeout, $state, $stateParams, ngDialog, Lead, Tradeshow, busyService, messageService, leadData) {

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
