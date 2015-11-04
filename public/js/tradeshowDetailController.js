'use strict';
(function() {
	/**
	 * Tradeshow Edit Controller
	 * @class TradeshowDetailController
	 * ---------------------------------
	 * Displays an edit form for a tradeshow
	 */
	angular
	.module('tradeshowControllers')
	.controller('TradeshowDetailController',
		['$rootScope', '$scope', 'Tradeshow', '$stateParams', 'ngDialog', 'leadService', '$state', 'loginService', 'busyService', 'messageService', '$q', 'CacheFactory',
		function TradeshowDetailController($rootScope, $scope, Tradeshow, $stateParams, ngDialog, leadService, $state, loginService, busyService, messageService, $q, CacheFactory) {

		if (!CacheFactory.get('leadFormCache')) {
			CacheFactory('leadFormCache', {
			  maxAge: 60 * 60 * 1000,
			  deleteOnExpire: 'aggressive',
			  storageMode: 'localStorage'
			});
		}
		var formCache = CacheFactory.get('leadFormCache');

		$scope.lastFetchedPage = 1;
		
		// Cached scope vars
		$scope.leadCurrentPage = 1;
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';
		$scope.query = '';

		// Watch scope variables to update cache
		var watch = ['leadCurrentPage', 'orderBy', 'orderByReverse', 'perPage', 'query'];
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

		// Scope variables
		$scope.titlePrefix = 'Editing';
		$scope.model = 'tradeshow';
		$scope.leadCount = 0;
		$scope.isNew = false;
		$scope.leads = [];
		$scope.submitted = false;
		$scope.lastFetchedPage = 1;

		// Get the scoped tradeshow when we are confirmed to have a valid token
		$rootScope.$on('event:auth-logged-in', function() {
			$scope.getTradeshow()
				.then(function() {
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
					})
					.catch(function(payload) {
						if (payload.status == 500) {
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

		// Watch messageService messages
		$scope.$watch(function () { return messageService.messages; }, function (newVal, oldVal) {
		    if (typeof newVal !== 'undefined') {
		        $scope.messages = messageService.messages;
		    }
		});


		// Get the Tradeshow using the Tradeshow resource
		$scope.getTradeshow = function() {
			busyService.show();
			var deferred = $q.defer();
			Tradeshow.
				get({tradeshowId:$stateParams.tradeshowId}).
				$promise.
				then(function(payload) {
					$scope.tradeshow = payload;
					if ($scope.tradeshow.active == 1) {
						jQuery('input[name="active"]').bootstrapSwitch('state', true);
					}
					$scope.getLeads()
						.then(function(payload) {
							deferred.resolve(payload);
						})
						.catch(function() {
							deferred.reject(payload);
						});

				})
				.catch(function(payload) {
					deferred.reject(payload);
				});
			return deferred.promise;
		};

		/**
		 * Callback to 'go back' button
		 *
		 * @return {[void]}
		 */
		$scope.goBack = function() {
			$state.go('tradeshows');
		};

		/**
		 * Save the currently scoped tradeshow using Tradeshow resource
		 *
		 * @return {[void]}
		 */
		$scope.save = function() {
			if ($scope.validate()) {
				// Alter the "busy" indicator message
				busyService.setMessage('Saving');

				// Manually fade in "busy" indicator
				busyService.show();

				// Use Tradeshow resource to save currently scoped tradeshow
				Tradeshow.save($scope.tradeshow).$promise
					.then(function(payload) {
						// Set the tradeshow in scope
						$scope.tradeshow = payload;

						// Manually fade out "busy" indicator
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
						// Manually fade out "busy" indicator
						busyService.hide();

						// Show error alert
						messageService.addMessage({
							icon: 'exclamation-sign',
							type: 'danger',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Sorry, something went wrong.'
						});
					});
			}
		};

		/**
		 * Validate the form
		 */
		$scope.validate = function() {
			$scope.submitted = true;
			return ! ($scope.tradeshowForm.name.$invalid || $scope.tradeshowForm.location.$invalid);
		};


		/**
		 * Get the leads using the leadService
		 *
		 * @param  {[int]} pageNumber [a page number]
		 * @return {[void]}
		 */
		$scope.getLeads = function(pageNumber) {
			if (pageNumber === undefined) {
				pageNumber = $scope.leadCurrentPage;
			}
			$scope.lastFetchedPage = pageNumber;
			var deferred = $q.defer();
			leadService
				.retrieve(
					$scope.tradeshow.id, 
					pageNumber, 
					$scope.perPage, 
					$scope.orderBy, 
					$scope.orderByReverse, 
					$scope.query
				)
				.then(function(payload) {
					var response = payload.data;
					$scope.leads = response.data;
					$scope.leadCurrentPage = response.current_page;
					$scope.leadTotalPages = response.last_page;
					var pages = [];
					for(var i=1;i<=response.last_page;i++) {
						pages.push(i);
					}
					$scope.leadRange = pages;

					// Calculate leads from pagination
					if ($scope.leadCount === 0) {
						$scope.leadCount = $scope.leadTotalPages * $scope.leads.length;
					}

					// Resolve promise
					deferred.resolve(payload);
				})
				.catch(function(payload) {
					// Reject promise
					deferred.reject(payload);
				});
			return deferred.promise;
		};

		$scope.refreshLeads = function() {
			$scope.getLeads().then(function(payload) {
				// Page number was out of range, fetching last page available
				if ($scope.lastFetchedPage > payload.data.current_page) {
					$scope.getLeads(payload.data.last_page);
				}
				$scope.leadCount = payload.data.data.length;
			});
		};

		/**
		 * Find a lead in the local array in scope using its id
		 *
		 * @param  {[int]} lead_id
		 * @return {[obj]} lead
		 */
		$scope.pluckLead = function(lead_id) {
			for (var n = 0, lead; (lead = $scope.leads[n]); n++) {
				if (lead.id == lead_id) { return lead; }
			}
			return false;
		};

		/**
		 * Delete a lead
		 *
		 * @param  {[int]} lead_id
		 * @param  {[angular event]} $event
		 * @return {[void]}
		 */
		$scope.deleteLead = function(lead_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			leadService.deleteLead( $scope.pluckLead(lead_id) );
		};

		/**
		 * Ensure we don't go out-of-bounds
		 *
		 * @return {[void]}
		 */
		$scope.updatePagination = function() {
			if ($scope.leadCurrentPage != 1) {
				$scope.getLeads(1);
			}
		};

		/**
		 * Remove a message from messageService
		 * @param  {[type]} message_id [description]
		 * @return {[void]}
		 */
		$scope.removeMessage = function(message_id) {
			messageService.removeMessage(message_id);
		};


		// Check API Access, refresh token
		loginService.checkApiAccess();
	}]);
})(jQuery);