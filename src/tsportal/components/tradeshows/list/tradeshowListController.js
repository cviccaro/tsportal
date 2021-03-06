/**
 * Tradeshow List Controller
 * @class TradeshowListController
 * ------------------------------------------------------
 * Displays a paginated, filtered table of all tradeshows.
 */

(function() {

	'use strict';

	angular
		.module('tsportal.tradeshows')
		.controller('TradeshowListController', TradeshowListController);

	function TradeshowListController($scope, $q, $timeout, $window, authService, busyService, tradeshowService, leadService, promisedData, promisedFormCache) {
		var vm = this;

		vm.deleteTradeshow 	 = deleteTradeshow;
		vm.deleteLead		 = deleteLead;
		vm.downloadReport 	 = downloadReport;
		vm.getLeads 		 = getLeads;
		vm.getTradeshows 	 = getTradeshows;
		vm.isRecent			 = isRecent;
		vm.pluckLead		 = pluckLead;
		vm.pluckTradeshow 	 = pluckTradeshow;
		vm.refreshTradeshows = refreshTradeshows;

		vm.currentPage 		= promisedData.data.current_page;
		vm.formCache		= promisedFormCache;
		vm.lastFetchedPage  = 1;
		vm.orderBy 			= "updated_at";
		vm.orderByReverse 	= "1";
		vm.perPage 			= "15";
		vm.query 			= "";
		vm.totalPages		= promisedData.data.last_page;
		vm.tradeshows		= promisedData.data.data;
		
		activate();

		/////////

		function activate() {
			// Watch scope variables to update cache
			angular.forEach(['currentPage', 'orderBy', 'orderByReverse', 'perPage', 'query'], function(key) {
				var val = vm.formCache.get(key);
				if (val !== undefined && val !== null) {
					vm[key] = val;
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
		 * Delete a tradeshow using the tradeshow service
		 */
		function deleteTradeshow(tradeshow_id) {
			var tradeshow = vm.pluckTradeshow(tradeshow_id);
			tradeshowService.deleteTradeshow(tradeshow);
		}

		/**
		 * Checks if a tradeshow has leads, and routes user to URL to download report
		 */
		function downloadReport(tradeshow_id) {
			$window.location.href = '/api/tradeshows/' + tradeshow_id + '/report?token=' + authService.token.get();
		}

		/**
		 * Use leadService to fetch leads for the tradeshow
		 */
		 function getLeads(pageNumber, tradeshow) {
		 	busyService.forceHide();
			if (tradeshow === undefined) {
				tradeshow = vm.selectedTradeshow;
			}
			else {
				vm.selectedTradeshow = tradeshow;
			}
			$timeout(function() {
				leadService
					.retrieve(tradeshow.id, pageNumber, 50, 'id', 0)
					.then(function(payload) {
						busyService.forceHide(true);
						var response = payload.data;

						vm.leads = response.data;
						vm.leadCurrentPage = response.current_page;
						vm.leadTotalPages = response.last_page;
					})
					.catch(function(payload) {
						vm.addErrorMessage();
					});
			});
		}

		/**
		 * [getTradeshows use tradeshowService to fetch tradeshows]
		 */
		function getTradeshows(pageNumber) {
			if (pageNumber === undefined) {
				pageNumber = vm.currentPage;
			}
			vm.lastFetchedPage = pageNumber;

			busyService.setMessage('Working on it');

			var deferred = $q.defer();

			tradeshowService
				.retrieve(
					pageNumber,
					vm.perPage,
					vm.orderBy,
					vm.orderByReverse,
					vm.query
				)
				.then(function(payload) {
					var response = payload.data;

					vm.tradeshows = response.data;
					vm.currentPage = response.current_page;
					vm.totalPages = response.last_page;

					deferred.resolve(payload);
				})
				.catch(function(payload) {
					deferred.reject(payload);
				});
			return deferred.promise;
		}

		/**
		 * Calculate if tradeshow was updated recently
		 */
		function isRecent(tradeshow) {
			if (tradeshow.updated_at.substr(0,1) === '-') { return false; }
			return moment().format('x') - moment(tradeshow.updated_at).format('x') < (60 * 60 * 1000);
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
		 * Find a tradeshow in the local array by id
		 */
		function pluckTradeshow(tradeshow_id) {
			for (var n = 0, tradeshow; (tradeshow = vm.tradeshows[n]); n++) {
				if (tradeshow.id == tradeshow_id) { return tradeshow; }
			}
			return false;
		}

		/**
		 * [refreshTradeshows Calls getTradeshows with the currently scoped page number]
		 */
		 function refreshTradeshows() {
			vm.getTradeshows().then(function(payload) {
				// Page number was out of range, fetching last page available
				if (vm.lastFetchedPage > payload.data.current_page) {
					vm.getTradeshows(payload.data.last_page);
				}
			});
		}
	}
})();
