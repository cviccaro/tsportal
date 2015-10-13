(function($) {
	'use strict';

	var tradeshowControllers = angular.module('tradeshowControllers', ['ngDialog']);

	/**
	 * Tradeshow List Controller
	 * --------------------
	 * @param  {[type]} $rootScope [description]
	 * @param  {[type]} $scope     [description]
	 * @param  {[type]} Tradeshow  [description]
	 * @param  {[type]} $http      [description]
	 * @param  {[type]} leadGetter [description]
	 * @param  {String} ngDialog   [description]
	 * @return {[type]}            [description]
	 */
	tradeshowControllers.controller('TradeshowController', ['$rootScope', '$scope', 'Tradeshow', '$http', 'leadGetter', 'ngDialog', function($rootScope, $scope, Tradeshow, $http, leadGetter, ngDialog) {
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';
		$scope.getTradeshows = function(pageNumber){

			if(pageNumber===undefined){
				pageNumber = '1';
			}
			$http.get('api/tradeshows?page='+pageNumber+'&perPage=' + $scope.perPage + '&orderBy=' + $scope.orderBy + '&orderByReverse=' + parseInt($scope.orderByReverse)).
			then(function(payload) {
				var response = payload.data;
				$scope.tradeshows        = response.data;
				$scope.totalPages   = response.last_page;
				$scope.currentPage  = response.current_page;

				// Pagination Range
				var pages = [];

				for(var i=1;i<=response.last_page;i++) {
					pages.push(i);
				}

				$scope.range = pages; 

			}, function(errorResponse) {
				console.log('error loading tradeshows: ' + errorResponse)
			});

		};

		$scope.getTradeshows();

		$scope.refreshTradeshows = function refreshTradeshows() {
			$scope.getTradeshows($scope.currentPage);
		}

		$scope.handleLeads = function() {
			$scope.leadRange = leadGetter.getRange();
			$scope.leads = leadGetter.getLeads();
			$scope.leadTotalPages = leadGetter.getLastPage();
			$scope.leadCurrentPage = leadGetter.getCurrentPage();
		};

		$scope.getLeads = function getLeads(tradeshow, pageNumber) {
			$scope.selectedTradeshow = tradeshow;
			leadGetter.setCurrentTradeshowId(tradeshow.id);
			leadGetter.retrieveLeads(pageNumber, 50, 'id', 0, $scope.handleLeads);
		};

		$scope.refreshLeads = function refreshLeads(pageNumber) {
			leadGetter.retrieveLeads(pageNumber, 50, 'id', 0, $scope.handleLeads);
		};
		// pluck tradeshow from tradeshows array
		$scope.pluckTradeshow = function pluckTradeshow(tradeshow_id) {
			for (var n = 0, tradeshow; tradeshow = $scope.tradeshows[n]; n++) {
				if (tradeshow.id == tradeshow_id) { return tradeshow; }
			}
			return false;
		}
		$scope.deleteTradeshow = function deleteTradeshow(tradeshow_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			var tradeshow = $scope.pluckTradeshow(tradeshow_id),
				tradeshow_name = tradeshow.name;
			$scope.activeDialog = ngDialog.openConfirm(
				{	
					plain: true, 
					className: 'dialog-destroy ngdialog-theme-default',
					template: '<span class="glyphicon glyphicon-trash red icon-large"></span><span>Are you sure you want to delete Tradeshow <em>' + tradeshow_name + '</em>?<br /><strong>This cannot be undone.</strong></span><div class="dialog-buttons"><button class="btn btn-danger" ng-click="confirm()">Yes, delete</button> <button class="btn btn-cancel" ng-click="closeThisDialog()">Cancel</button></div>',
					showClose: false
				}
			).
			then(function() {
				//console.log('confirmed to delete tradeshow ' + tradeshow_id + ': ',tradeshow);
				$rootScope.workingMessage = 'Deleting';
				$('.loading-indicator').removeClass('ng-hide').fadeIn(100);
				Tradeshow.
					delete({tradeshowId:tradeshow_id}).
					$promise.
					then(function(payload) {
						$('.loading-indicator').fadeOut(100).addClass('ng-hide');
						if (payload.hasOwnProperty('success') && payload.success == true) {
							ngDialog.open({
								plain: true,
								className: 'dialog-success ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Tradeshow <em>' + tradeshow_name + '</em> has been successfully deleted.</span>',
							})
							.closePromise
							.then(function() {
								window.location.reload();
							})
						}
						else {
							ngDialog.open({
								plain: true,
								className: 'dialog-error ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
							})
						}
					}, function(errorResponse) {
						$('.loading-indicator').fadeOut(100).addClass('ng-hide');
						ngDialog.open({
							plain: true,
							className: 'dialog-error ngdialog-theme-default',
							template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
						})
					})
			})
		};

		$scope.generateReport = function(tradeshow_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			leadGetter.setCurrentTradeshowId(tradeshow_id);
			leadGetter.retrieveLeads(1, 15, 'id', 0, function(response) {
				var leads = response.data;
				console.log(response);
				if (leads.length) {
					window.location.href = '/tradeshows/' + tradeshow_id + '/report';
				}
				else {
					ngDialog.open({plain:true, template: "Sorry, no leads available"});
				}
			});

			console.log('generate report for tradeshow ' + tradeshow_id);
		}
	}]);

	/**
	 * Tradeshow Edit Controller
	 * ---------------
	 * @param  {[type]} $rootScope   [description]
	 * @param  {[type]} $scope       [description]
	 * @param  {[type]} Tradeshow    [description]
	 * @param  {[type]} $stateParams [description]
	 * @param  {[type]} ngDialog)    [description]
	 * @return {[type]}              [description]
	 */
	tradeshowControllers.controller('TradeshowDetailController', ['$rootScope', '$scope', 'Tradeshow', '$stateParams', 'ngDialog', 'leadGetter', function($rootScope, $scope, Tradeshow, $stateParams, ngDialog, leadGetter) {
		$scope.model = 'tradeshow';
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';
		$scope.leadCount = 0;
		$scope.isNew = false;
		Tradeshow.
			get({tradeshowId:$stateParams.tradeshowId}).
			$promise.
			then(function(data) {
				$scope.tradeshow = data.tradeshow;
				$scope.title = 'Editing Tradeshow ' + $scope.tradeshow.name;
				if ($scope.tradeshow.active == 1) {
					jQuery('input[name="active"]').bootstrapSwitch('state', true)
				}
				$scope.getLeads();
				$scope.setTitle();
			});
		$scope.setTitle = function setTitle() {
			$scope.title = 'Editing Tradeshow <em>' + $scope.tradeshow.name + '</em>';
		};
		$scope.goBack = function goBack() {
			window.location.hash = '#/tradeshows';
		};
		$scope.save = function save() {
			$rootScope.workingMessage = 'Saving';
			$('.loading-indicator').removeClass('ng-hide').fadeIn(100);
			Tradeshow.save($scope.tradeshow).$promise.then(function(payload) {
				//console.log('payload after-update: ', payload)
				$scope.tradeshow = payload.tradeshow;
				$scope.setTitle();
				$('.loading-indicator').fadeOut(100).addClass('ng-hide');
				ngDialog.open(
					{	
						plain: true, 
						className: 'dialog-save ngdialog-theme-default',
						template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Your changes have been saved.</span>'
					}
				);
			});
		};

		$scope.leads = [];

		$scope.handleLeads = function() {
			$scope.leadRange = leadGetter.getRange();
			$scope.leads = leadGetter.getLeads();
			$scope.leadTotalPages = leadGetter.getLastPage();
			$scope.leadCurrentPage = leadGetter.getCurrentPage();
			if ($scope.leadCount === 0) { 
				$scope.leadCount = $scope.leadTotalPages * $scope.leads.length;
			}
		};

		$scope.getLeads = function getLeads(pageNumber) {
			$scope.selectedTradeshow = $scope.tradeshow;
			leadGetter.setCurrentTradeshowId($scope.tradeshow.id);
			leadGetter.retrieveLeads(pageNumber, $scope.perPage, $scope.orderBy, $scope.orderByReverse, $scope.handleLeads);
		};

		$scope.refreshLeads = function refreshLeads(pageNumber) {
			leadGetter.retrieveLeads(pageNumber, $scope.perPage, $scope.orderBy, $scope.orderByReverse, $scope.handleLeads);
		}

		$scope.updatePagination = function updatePagination() {
			if ($scope.leadCurrentPage != 1) {
				$scope.refreshLeads(1);
			}
			// $scope.leadCount = $scope.filteredLeads.length
			// var last_page = Math.ceil($scope.leadCount / $scope.perPage);
			// var pages = [];
			// for (var i=1;i<=last_page; i++) {
			// 	pages.push(i);
			// }
			// $scope.leadRange = pages;
			// $scope.leadTotalPages = pages.length;
			// console.log($scope.filteredLeads);
		}
	}]);

	/**
	 * Tradeshow Create Controller
	 * -------
	 * @param  {[type]} $rootScope   [description]
	 * @param  {[type]} $scope       [description]
	 * @param  {[type]} Tradeshow    [description]
	 * @param  {[type]} $stateParams [description]
	 * @param  {[type]} ngDialog)    [description]
	 * @return {[type]}              [description]
	 */
	tradeshowControllers.controller('TradeshowCreateController', ['$rootScope', '$scope', 'Tradeshow', '$stateParams', 'ngDialog', function($rootScope, $scope, Tradeshow, $stateParams, ngDialog) {
		$scope.isNew = true;
		$scope.model = 'tradeshow';
		$scope.goBack = function goBack() {
			window.location.hash = '#/tradeshows';
		};
		$scope.save = function save() {
			console.log($scope.tradeshow);
			$rootScope.workingMessage = 'Saving new';
			$('.loading-indicator').removeClass('ng-hide').fadeIn(100);
			if (!$scope.tradeshow.hasOwnProperty('active')) {
				$scope.tradeshow.active = $('input[name="active"]')[0].checked;
			}
			Tradeshow.create($scope.tradeshow).$promise.then(function(payload) {
				var tradeshow_id = payload.tradeshow.id;
				$('.loading-indicator').fadeOut(100).addClass('ng-hide');
				ngDialog.open(
					{
						plain: true, 
						className: 'dialog-save ngdialog-theme-default',
						template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>The new tradeshow has been created successfully.</span>'
					}
				).
				closePromise.
				then(function(data) {
					window.location.hash = '#/tradeshows/' + tradeshow_id + '/edit';
				});
			})
		}
		$scope.title = 'Create new Tradeshow';
		setTimeout(function() {
			$('.loading-indicator').fadeOut(100).addClass('ng-hide');
		},100);
	}]);

})(jQuery);