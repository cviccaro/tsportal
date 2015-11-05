'use strict';
(function($) {
	/**
	 * Tradeshow List Controller
	 * @class TradeshowListController
	 * ------------------------------------------------------
	 * Displays a paginated, filtered table of all tradeshows.
	 */
	angular
	.module('tradeshowControllers')
	.controller('TradeshowListController',
		['$rootScope', '$scope', 'tradeshowService', 'leadService', 'loginService', 'ngDialog', 'busyService', '$q', 'messageService', 'CacheFactory',
		function TradeshowListController($rootScope, $scope, tradeshowService, leadService, loginService, ngDialog, busyService, $q, messageService, CacheFactory) {

		if (!CacheFactory.get('formCache')) {
			CacheFactory('formCache', {
			  maxAge: 60 * 60 * 1000,
			  deleteOnExpire: 'aggressive',
			  storageMode: 'localStorage'
			});
		}
		var formCache = CacheFactory.get('formCache');

		$scope.lastFetchedPage = 1;

		// Cached scope vars
		$scope.currentPage = 1;
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';
		$scope.query = '';

		// Watch scope variables to update cache
		var watch = ['currentPage', 'orderBy', 'orderByReverse', 'perPage', 'query'];
		angular.forEach(watch, function(varName) {
			var val = formCache.get(varName);
			if (val !== undefined && val !== null) {
				$scope[varName] = val;
			}
			$scope.$watch(varName, function(newVal, oldVal) {
				if (typeof newVal !== 'undefined') {
				    formCache.put(varName, newVal);
				}
			});
		});


		// Watch messageService messages
		$scope.$watch(function () { return messageService.messages; }, function (newVal, oldVal) {
		    if (typeof newVal !== 'undefined') {
		        $scope.messages = messageService.messages;
		    }
		});

		// Get the scoped tradeshow when we are confirmed to have a valid token
		$rootScope.$on('event:auth-logged-in', function() {
			$scope.getTradeshows().then(function() {
				busyService.hide();
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
		});


		// Refresh authorization token when it is expired transparently to the user
		// and re-run the request that failed (happens automatically from http-auth-interceptor)
		$rootScope.$on('event:auth-loginRequired', function(event, data) {
			var token = loginService.refreshToken.get();
			if (token !== null) {
				loginService.refresh(token)
					.then(function(payload) {
						authService.loginConfirmed();
						$scope.refreshTradeshows();
					})
					.catch(function(payload) {
						if (payload.status == 500 || payload.status == 400) {
							// token is totally expired, cannot be refreshed, return to login
							loginService.logout();
						}
					});
			}
			else {
				// token is totally expired, cannot be refreshed, return to login
				loginService.logout();
			}
		});

		// Scope functions

		/**
		 * [getTradeshows use tradeshowService to fetch tradeshows]
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.getTradeshows = function(pageNumber) {
			busyService.setMessage('Working on it');
			busyService.show();
			if (pageNumber === undefined) {
				pageNumber = $scope.currentPage;
			}
			$scope.lastFetchedPage = pageNumber;

			var deferred = $q.defer();

			tradeshowService
				.retrieve(
					pageNumber,
					$scope.perPage,
					$scope.orderBy,
					$scope.orderByReverse,
					$scope.query
				)
				.then(function(payload) {
					var response = payload.data;

					$scope.tradeshows = response.data;
					$scope.currentPage = response.current_page;
					$scope.totalPages = response.last_page;

					deferred.resolve(payload);
				})
				.catch(function(payload) {
					$scope.$emit('event:auth-loginRequired');
					deferred.reject(payload);
				});
			return deferred.promise;
		};

		/**
		 * [refreshTradeshows Calls getTradeshows with the currently scoped page number]
		 * @return {[void]}
		 */
		$scope.refreshTradeshows = function() {
			$scope.getTradeshows().then(function(payload) {
				// Page number was out of range, fetching last page available
				if ($scope.lastFetchedPage > payload.data.current_page) {
					$scope.getTradeshows(payload.data.last_page);
				}
			});
		};


		/**
		 * Use leadService to fetch leads for the tradeshow
		 *
		 * @param  {[int]} tradeshow_id  [tradeshow ID]
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.getLeads = function(pageNumber, tradeshow) {
			busyService.show();
			if (tradeshow === undefined) {
				tradeshow = $scope.selectedTradeshow;
			}
			else {
				$scope.selectedTradeshow = tradeshow;
			}

			leadService
				.retrieve(tradeshow.id, pageNumber, 50, 'id', 0)
				.then(function(payload) {
					var response = payload.data;

					$scope.leads = response.data;
					$scope.leadCurrentPage = response.current_page;
					$scope.leadTotalPages = response.last_page;

					busyService.hide();
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
		};

		/**
		 * Find a tradeshow in the local array in scope using its id
		 *
		 * @param  {[int]} tradeshow_id
		 * @return {[obj]} tradeshow
		 */
		$scope.pluckTradeshow = function(tradeshow_id) {
			for (var n = 0, tradeshow; (tradeshow = $scope.tradeshows[n]); n++) {
				if (tradeshow.id == tradeshow_id) { return tradeshow; }
			}
			return false;
		};

		/**
		 * Delete a tradeshow using the tradeshow service
		 *
		 * @param  {[int]} tradeshow_id
		 * @param  {[event]} $event      [angular event]
		 * @return {[void]}
		 */
		$scope.deleteTradeshow = function(tradeshow_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			var tradeshow = $scope.pluckTradeshow(tradeshow_id);
			tradeshowService.deleteTradeshow(tradeshow);
		};

		/**
		 * Checks if a tradeshow has leads, and routes user to URL to download report
		 *
		 * @param  {[int]} tradeshow_id [tradeshow id]
		 * @param  {[obj]} $event       [angular $event]
		 * @return {[void]}
		 */
		$scope.downloadReport = function(tradeshow_id, $event) {
			window.location.href = '/api/tradeshows/' + tradeshow_id + '/report?token=' + loginService.token.get();
		};

		/**
		 * Remove a message from messageService
		 * @param  {[type]} message_id [description]
		 * @return {[void]}
		 */
		$scope.removeMessage = function(message_id) {
			messageService.removeMessage(message_id);
		};

		// No token, no access
		loginService.checkApiAccess();
	}]);

})(jQuery);