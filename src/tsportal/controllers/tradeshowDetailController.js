/**
 * Tradeshow Edit Controller
 * @class TradeshowDetailController
 * ---------------------------------
 * Displays an edit form for a tradeshow
 */

(function() {

	'use strict';

	angular
		.module('tradeshowControllers')
		.controller('TradeshowDetailController', TradeshowDetailController);

	function TradeshowDetailController($scope, $q, $http, CacheFactory, $state, ngDialog, loginService,
		busyService, messageService, Tradeshow, leadService, promisedData, promisedLeadData, promisedFormCache)
	{
		var vm = this;

		vm.deleteLead = deleteLead;
		vm.getLeads = getLeads;
		vm.goBack = goBack;
		vm.pluckLead = pluckLead;
		vm.refreshLeads = refreshLeads;
		vm.save = save;
		vm.updatePagination = updatePagination;

		vm.currentPage = promisedLeadData.data.current_page;
		vm.formCache = promisedFormCache;
		vm.isNew = false;
		vm.lastFetchedPage = 1;
		vm.leads = promisedLeadData.data.data;
		vm.orderBy = "updated_at";
		vm.orderByReverse = "0";
		vm.perPage = "15";
		vm.query = "";
		vm.titlePrefix = "Editing";
		vm.tradeshow = promisedData;
		vm.totalPages = promisedLeadData.data.last_page;

		activate();

		//////////

		function activate() {
			// Watch scope variables to update cache
			angular.forEach(['currentPage', 'orderBy', 'omg', 'orderByReverse', 'perPage', 'query'], function(key) {
				if (vm.formCache.get(key)) {
					vm[key] = vm.formCache.get(key);
				}
				$scope.$watch('ctrl.' + key, function(newVal, oldVal) {
					if (typeof newVal !== 'undefined') {
					    vm.formCache.put(key, newVal);
					}
				});
			});
		}

		/**
		 * Delete a lead
		 */
		function deleteLead(lead_id) {
			leadService.deleteLead( vm.pluckLead(lead_id) );
		}

		/**
		 * Get the leads using the leadService
		 */
		function getLeads(pageNumber) {
			if (pageNumber === undefined) {
				pageNumber = vm.currentPage;
			}
			vm.lastFetchedPage = pageNumber;

			var deferred = $q.defer();

			leadService
				.retrieve(
					vm.tradeshow.id,
					pageNumber,
					vm.perPage,
					vm.orderBy,
					vm.orderByReverse,
					vm.query
				)
				.then(function(payload) {
					var response = payload.data;
					vm.leads = response.data;
					vm.currentPage = response.current_page;
					vm.totalPages = response.last_page;

					// Resolve promise
					deferred.resolve(payload);
				})
				.catch(function(payload) {
					// Reject promise
					deferred.reject(payload);
				});
			return deferred.promise;
		}

		/**
		 * Callback to 'go back' button
		 */
		function goBack() {
			$state.go('tradeshows');
		}

		/**
		 * Find a lead in the local array in scope by id
		 */
		function pluckLead(lead_id) {
			for (var n = 0, lead; (lead = vm.leads[n]); n++) {
				if (lead.id == lead_id) { return lead; }
			}
			return false;
		}

		/**
		 * Refresh the leads
		 */
		function refreshLeads() {
			vm.getLeads().then(function(payload) {
				// Page number was out of range, fetching last page available
				if (vm.lastFetchedPage > payload.data.current_page) {
					vm.getLeads(payload.data.last_page);
				}
			});
		}

		/**
		 * Save the currently scoped tradeshow using Tradeshow resource
		 */
		function save() {
			if (vm.tradeshowForm.$valid) {
				// Alter the "busy" indicator message
				busyService.setMessage('Saving');

				// Use Tradeshow resource to save currently scoped tradeshow
				Tradeshow.save(vm.tradeshow).$promise
					.then(function(payload) {
						// Set the tradeshow in scope
						vm.tradeshow = payload;

						// Show success alert
						vm.addSuccessMessage();

						$http.defaults.cache.removeAll();
					})
					.catch(function(payload) {
						// Show error alert
						vm.addErrorMessage();
					});
			}
		}

		/**
		 * Ensure we don't go out-of-bounds
		 */
		function updatePagination() {
			if (vm.currentPage != 1) {
				vm.getLeads(1);
			}
		}
	}
})();
