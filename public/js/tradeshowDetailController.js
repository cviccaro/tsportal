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

	function TradeshowDetailController($scope, $q, $http, CacheFactory, $state, $stateParams, ngDialog, loginService, busyService, messageService, Tradeshow, leadService) {

		var vm = this;

		vm.deleteLead = deleteLead;
		vm.getLeads = getLeads;
		vm.getTradeshow = getTradeshow;
		vm.goBack = goBack;
		vm.pluckLead = pluckLead;
		vm.refreshLeads = refreshLeads;
		vm.save = save;
		vm.updatePagination = updatePagination;
		vm.validate = validate;

		vm.currentPage = 1;
		vm.isNew = false;
		vm.lastFetchedPage = 1;
		vm.leads = [];
		vm.model = 'tradeshow';
		vm.orderBy = "updated_at";
		vm.orderByReverse = "0";
		vm.perPage = "15";
		vm.query = "";
		vm.submitted = false;
		vm.titlePrefix = 'Editing';

		//////////

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
		 * Get the Tradeshow using the Tradeshow resource
		 */
		function getTradeshow() {
			var deferred = $q.defer();
			Tradeshow.
				get({tradeshowId:$stateParams.tradeshowId}).
				$promise.
				then(function(payload) {
					vm.tradeshow = payload;
					if (vm.tradeshow.active == 1) {
						jQuery('input[name="active"]').bootstrapSwitch('state', true);
					}
					vm.getLeads(vm.currentPage)
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
			if (vm.validate()) {
				// Alter the "busy" indicator message
				busyService.setMessage('Saving');

				// Use Tradeshow resource to save currently scoped tradeshow
				Tradeshow.save(vm.tradeshow).$promise
					.then(function(payload) {
						// Set the tradeshow in scope
						vm.tradeshow = payload;

						// Show success alert
						messageService.addMessage({
							icon: 'ok',
							type: 'success',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Your changes have been saved'
						});

						$http.defaults.cache.removeAll();
					})
					.catch(function(payload) {
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
		}

		/**
		 * Ensure we don't go out-of-bounds
		 */
		function updatePagination() {
			if (vm.currentPage != 1) {
				vm.getLeads(1);
			}
		}

		/**
		 * Validate the form
		 */
		function validate() {
			vm.submitted = true;
			return ! (vm.tradeshowForm.name.$invalid || vm.tradeshowForm.location.$invalid);
		}

		/////////
		
		if (!CacheFactory.get('leadFormCache')) {
			CacheFactory('leadFormCache', {
			  maxAge: 60 * 60 * 1000,
			  deleteOnExpire: 'aggressive',
			  storageMode: 'localStorage'
			});
		}
		var formCache = CacheFactory.get('leadFormCache');

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

		// Check API Access, refresh token
		loginService.checkApiAccess().then(function() {
			vm.getTradeshow()
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
