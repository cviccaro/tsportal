/**
 * Tradeshow List Controller
 * @class TradeshowListController
 * ------------------------------------------------------
 * Displays a paginated, filtered table of all tradeshows.
 */

(function() {

	'use strict';

	angular
		.module('tradeshowControllers')
		.controller('TradeshowListController', TradeshowListController);

	function TradeshowListController($scope, $q, CacheFactory, ngDialog, loginService, busyService, messageService, tradeshowService, leadService) {
		var vm = this;

		vm.deleteTradeshow = deleteTradeshow;
		vm.downloadReport = downloadReport;
		vm.getLeads = getLeads;
		vm.getTradeshows = getTradeshows;
		vm.pluckTradeshow = pluckTradeshow;
		vm.refreshTradeshows = refreshTradeshows;

		vm.currentPage 		= 1;
		vm.lastFetchedPage = 1;
		vm.orderBy 			= "updated_at";
		vm.orderByReverse 	= "0";
		vm.perPage 			= "15";
		vm.query 			= "";

		/////////
		
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
			window.location.href = '/api/tradeshows/' + tradeshow_id + '/report?token=' + loginService.token.get();
		}

		/**
		 * Use leadService to fetch leads for the tradeshow
		 */
		 function getLeads(pageNumber, tradeshow) {
			if (tradeshow === undefined) {
				tradeshow = vm.selectedTradeshow;
			}
			else {
				vm.selectedTradeshow = tradeshow;
			}

			leadService
				.retrieve(tradeshow.id, pageNumber, 50, 'id', 0)
				.then(function(payload) {
					var response = payload.data;

					vm.leads = response.data;
					vm.leadCurrentPage = response.current_page;
					vm.leadTotalPages = response.last_page;
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

		/////////

		if (!CacheFactory.get('formCache')) {
			CacheFactory('formCache', {
			  maxAge: 60 * 60 * 1000,
			  deleteOnExpire: 'aggressive',
			  storageMode: 'localStorage'
			});
		}
		var formCache = CacheFactory.get('formCache');

		// Watch scope variables to update cache
		angular.forEach(['currentPage', 'orderBy', 'orderByReverse', 'perPage', 'query'], function(varName) {
			var val = formCache.get(varName);
			if (val !== undefined && val !== null) {
				vm[varName] = val;
			}
			$scope.$watch('ctrl.' + varName, function(newVal, oldVal) {
				if (typeof newVal !== 'undefined') {
				    formCache.put(varName, newVal);
				}
			});
		});

		// No token, no access
		loginService.checkApiAccess().then(function(payload) {
			vm.getTradeshows(vm.currentPage)
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
